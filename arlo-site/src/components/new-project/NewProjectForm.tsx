"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, LogOut } from "lucide-react";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { useDemo } from "@/components/demo/DemoProvider";
import { logoutAction } from "@/app/login/actions";
import { addProjectToDataset, type NewProjectInput } from "@/lib/demo/newProject";
import { saveProjectDraft, loadProjectDraft, clearProjectDraft } from "@/lib/demo/persistence";
import type { WorkType } from "@/lib/demo/types";

type ClientMode = "existing" | "new";

interface FormState {
  projectName: string;
  projectNumber: string;
  projectTypeId: string;
  disciplineId: string;
  deliveryMethodId: string;
  workType: WorkType | "";
  complexity: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  size: string;
  sizeUnit: string;
  estConstructionCost: string;
  startDate: string;
  estEndDate: string;

  clientMode: ClientMode;
  clientId: string;
  newClientName: string;
  newClientAddress: string;
  newClientCity: string;
  newClientState: string;
  newClientZip: string;
  newClientPhone: string;
  newClientEmail: string;

  contactFirstName: string;
  contactLastName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
  ownerId: string;
  contractorName: string;

  principalEmployeeId: string;
  pmEmployeeId: string;
  probability: string;

  feeStructureId: string;
  serviceTypeId: string;
  proposedFee: string;
  billingTerms: string;

  comments: string;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyForm(): FormState {
  return {
    projectName: "",
    projectNumber: "",
    projectTypeId: "",
    disciplineId: "",
    deliveryMethodId: "",
    workType: "",
    complexity: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    size: "",
    sizeUnit: "sf",
    estConstructionCost: "",
    startDate: todayIso(),
    estEndDate: "",
    clientMode: "existing",
    clientId: "",
    newClientName: "",
    newClientAddress: "",
    newClientCity: "",
    newClientState: "",
    newClientZip: "",
    newClientPhone: "",
    newClientEmail: "",
    contactFirstName: "",
    contactLastName: "",
    contactTitle: "",
    contactEmail: "",
    contactPhone: "",
    ownerId: "",
    contractorName: "",
    principalEmployeeId: "",
    pmEmployeeId: "",
    probability: "",
    feeStructureId: "",
    serviceTypeId: "",
    proposedFee: "",
    billingTerms: "",
    comments: "",
  };
}

type FormErrors = Partial<Record<keyof FormState, string>>;

export function NewProjectForm({ userName, userEmail }: { userName: string; userEmail: string }) {
  const { dataset, loading, updateDataset } = useDemo();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [result, setResult] = useState<{ projectName: string; projectNumber: string } | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadProjectDraft<FormState>().then((draft) => {
      if (!cancelled && draft) {
        setForm(draft);
        setDraftRestored(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const suggestedProjectNumber = useMemo(() => {
    if (!dataset) return "";
    const year = new Date().getFullYear().toString().slice(-2);
    return `P${year}-${String(dataset.proposals.length + 1).padStart(3, "0")}`;
  }, [dataset]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!form.projectName.trim()) next.projectName = "Project name is required.";
    if (!form.projectNumber.trim()) next.projectNumber = "Project number is required.";
    if (!form.projectTypeId) next.projectTypeId = "Select a project type.";
    if (!form.disciplineId) next.disciplineId = "Select a discipline.";
    if (!form.deliveryMethodId) next.deliveryMethodId = "Select a delivery method.";
    if (!form.workType) next.workType = "Select a work type.";
    if (!form.address.trim()) next.address = "Project address is required.";
    if (!form.city.trim()) next.city = "City is required.";
    if (!form.state.trim()) next.state = "State is required.";
    if (!form.zip.trim()) next.zip = "ZIP is required.";
    if (!form.startDate) next.startDate = "Start date is required.";

    if (form.clientMode === "existing") {
      if (!form.clientId) next.clientId = "Select an existing client.";
    } else {
      if (!form.newClientName.trim()) next.newClientName = "Client name is required.";
      if (!form.newClientAddress.trim()) next.newClientAddress = "Client address is required.";
      if (!form.newClientCity.trim()) next.newClientCity = "Client city is required.";
      if (!form.newClientState.trim()) next.newClientState = "Client state is required.";
      if (!form.newClientZip.trim()) next.newClientZip = "Client ZIP is required.";
    }

    if (!form.feeStructureId) next.feeStructureId = "Select a fee structure.";
    const fee = Number(form.proposedFee);
    if (!form.proposedFee || Number.isNaN(fee) || fee <= 0) {
      next.proposedFee = "Enter a proposed fee greater than $0.";
    }

    if (form.probability) {
      const p = Number(form.probability);
      if (Number.isNaN(p) || p < 0 || p > 100) {
        next.probability = "Probability must be between 0 and 100.";
      }
    }

    return next;
  }

  async function handleSaveDraft() {
    await saveProjectDraft(form);
    setDraftSavedAt(new Date().toLocaleTimeString());
  }

  function handleCancel() {
    if (window.confirm("Discard this project and clear the form?")) {
      setForm(emptyForm());
      setErrors({});
      void clearProjectDraft();
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting || !dataset) return;

    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      const firstKey = Object.keys(fieldErrors)[0];
      document.getElementById(firstKey)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    try {
      const input: NewProjectInput = {
        projectName: form.projectName.trim(),
        projectNumber: form.projectNumber.trim(),
        projectTypeId: form.projectTypeId,
        disciplineId: form.disciplineId,
        deliveryMethodId: form.deliveryMethodId,
        workType: form.workType as WorkType,
        complexity: form.complexity ? (Number(form.complexity) as 1 | 2 | 3 | 4 | 5) : undefined,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zip: form.zip.trim(),
        size: form.size ? Number(form.size) : undefined,
        sizeUnit: form.size ? form.sizeUnit : undefined,
        estConstructionCost: form.estConstructionCost ? Number(form.estConstructionCost) : undefined,
        startDate: form.startDate,
        estEndDate: form.estEndDate || undefined,
        clientId: form.clientMode === "existing" ? form.clientId : undefined,
        newClient:
          form.clientMode === "new"
            ? {
                name: form.newClientName.trim(),
                address: form.newClientAddress.trim(),
                city: form.newClientCity.trim(),
                state: form.newClientState.trim(),
                zip: form.newClientZip.trim(),
                phone: form.newClientPhone || undefined,
                email: form.newClientEmail || undefined,
              }
            : undefined,
        contactFirstName: form.contactFirstName || undefined,
        contactLastName: form.contactLastName || undefined,
        contactTitle: form.contactTitle || undefined,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
        ownerId: form.ownerId || undefined,
        contractorName: form.contractorName || undefined,
        principalEmployeeId: form.principalEmployeeId || undefined,
        pmEmployeeId: form.pmEmployeeId || undefined,
        probability: form.probability ? Number(form.probability) : undefined,
        feeStructureId: form.feeStructureId,
        serviceTypeId: form.serviceTypeId || undefined,
        proposedFee: Number(form.proposedFee),
        billingTerms: form.billingTerms || undefined,
        comments: form.comments || undefined,
      };

      updateDataset((d) => addProjectToDataset(d, input).dataset);
      await clearProjectDraft();
      setResult({ projectName: input.projectName, projectNumber: input.projectNumber });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-mist">
        <p className="text-sm text-navy/60">Loading...</p>
      </main>
    );
  }

  if (result) {
    return (
      <main className="min-h-screen bg-mist">
        <TopBar userName={userName} userEmail={userEmail} />
        <Container className="flex justify-center py-20">
          <div className="w-full max-w-lg rounded-2xl border border-steel/30 bg-white p-10 text-center shadow-sm">
            <CheckCircle2 className="mx-auto h-12 w-12 text-teal" />
            <h1 className="mt-4 text-xl font-bold text-navy">Project created</h1>
            <p className="mt-2 text-sm text-navy/60">
              <span className="font-semibold text-navy">{result.projectName}</span> (
              {result.projectNumber}) was saved to your ARLO demo workspace. It now appears
              alongside your other proposals and jobs in this browser.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                variant="secondary"
                onClick={() => {
                  setForm(emptyForm());
                  setResult(null);
                }}
              >
                Create Another Project
              </Button>
              <Link
                href="/demo/overview"
                className="inline-flex h-11 items-center justify-center rounded-full bg-navy px-6 text-sm font-semibold text-white hover:bg-navy/90"
              >
                Go to Demo Overview
              </Link>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-mist pb-24">
      <TopBar userName={userName} userEmail={userEmail} />

      <Container className="py-10">
        <h1 className="text-2xl font-bold text-navy">New Project</h1>
        <p className="mt-1 text-sm text-navy/60">
          Fill out the sections below to add a new project to your ARLO workspace.
        </p>
        {draftRestored && (
          <p className="mt-3 rounded-lg bg-teal/10 px-3.5 py-2 text-sm text-teal">
            Restored your last saved draft.
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-8">
          <Section title="Project Information">
            <Field label="Project Name" id="projectName" error={errors.projectName} required>
              <input
                id="projectName"
                value={form.projectName}
                onChange={(e) => set("projectName", e.target.value)}
                className={inputClass(!!errors.projectName)}
                placeholder="Riverside Medical Office Building"
              />
            </Field>
            <Field label="Project Number" id="projectNumber" error={errors.projectNumber} required>
              <input
                id="projectNumber"
                value={form.projectNumber}
                onChange={(e) => set("projectNumber", e.target.value)}
                className={inputClass(!!errors.projectNumber)}
                placeholder={suggestedProjectNumber || "P26-001"}
              />
            </Field>
            <Field label="Project Type" id="projectTypeId" error={errors.projectTypeId} required>
              <select
                id="projectTypeId"
                value={form.projectTypeId}
                onChange={(e) => set("projectTypeId", e.target.value)}
                className={inputClass(!!errors.projectTypeId)}
              >
                <option value="">Select...</option>
                {dataset?.lookups.projectTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Discipline" id="disciplineId" error={errors.disciplineId} required>
              <select
                id="disciplineId"
                value={form.disciplineId}
                onChange={(e) => set("disciplineId", e.target.value)}
                className={inputClass(!!errors.disciplineId)}
              >
                <option value="">Select...</option>
                {dataset?.lookups.disciplines.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Delivery Method" id="deliveryMethodId" error={errors.deliveryMethodId} required>
              <select
                id="deliveryMethodId"
                value={form.deliveryMethodId}
                onChange={(e) => set("deliveryMethodId", e.target.value)}
                className={inputClass(!!errors.deliveryMethodId)}
              >
                <option value="">Select...</option>
                {dataset?.lookups.deliveryMethods.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Work Type" id="workType" error={errors.workType} required>
              <select
                id="workType"
                value={form.workType}
                onChange={(e) => set("workType", e.target.value as WorkType)}
                className={inputClass(!!errors.workType)}
              >
                <option value="">Select...</option>
                {(["New Construction", "Renovation", "Addition", "Assessment"] as WorkType[]).map(
                  (w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  )
                )}
              </select>
            </Field>
            <Field label="Complexity (1-5)" id="complexity">
              <select
                id="complexity"
                value={form.complexity}
                onChange={(e) => set("complexity", e.target.value)}
                className={inputClass(false)}
              >
                <option value="">Not set</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Project Address" id="address" error={errors.address} required>
              <input
                id="address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                className={inputClass(!!errors.address)}
              />
            </Field>
            <Field label="City" id="city" error={errors.city} required>
              <input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} className={inputClass(!!errors.city)} />
            </Field>
            <Field label="State" id="state" error={errors.state} required>
              <input id="state" value={form.state} onChange={(e) => set("state", e.target.value)} className={inputClass(!!errors.state)} />
            </Field>
            <Field label="ZIP" id="zip" error={errors.zip} required>
              <input id="zip" value={form.zip} onChange={(e) => set("zip", e.target.value)} className={inputClass(!!errors.zip)} />
            </Field>
            <Field label="Size" id="size">
              <div className="flex gap-2">
                <input
                  id="size"
                  value={form.size}
                  onChange={(e) => set("size", e.target.value.replace(/[^0-9]/g, ""))}
                  className={inputClass(false)}
                  placeholder="45000"
                />
                <select
                  value={form.sizeUnit}
                  onChange={(e) => set("sizeUnit", e.target.value)}
                  className={inputClass(false) + " w-24 shrink-0"}
                >
                  <option value="sf">sf</option>
                  <option value="acres">acres</option>
                  <option value="units">units</option>
                </select>
              </div>
            </Field>
            <Field label="Estimated Construction Cost" id="estConstructionCost">
              <CurrencyInput
                id="estConstructionCost"
                value={form.estConstructionCost}
                onChange={(v) => set("estConstructionCost", v)}
              />
            </Field>
            <Field label="Start Date" id="startDate" error={errors.startDate} required>
              <input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className={inputClass(!!errors.startDate)}
              />
            </Field>
            <Field label="Estimated Completion Date" id="estEndDate">
              <input
                id="estEndDate"
                type="date"
                value={form.estEndDate}
                onChange={(e) => set("estEndDate", e.target.value)}
                className={inputClass(false)}
              />
            </Field>
          </Section>

          <Section title="Client & Contact Information">
            <div className="col-span-full flex gap-2 rounded-lg bg-mist p-1">
              <button
                type="button"
                onClick={() => set("clientMode", "existing")}
                className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
                  form.clientMode === "existing" ? "bg-white text-navy shadow-sm" : "text-navy/50"
                }`}
              >
                Existing Client
              </button>
              <button
                type="button"
                onClick={() => set("clientMode", "new")}
                className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
                  form.clientMode === "new" ? "bg-white text-navy shadow-sm" : "text-navy/50"
                }`}
              >
                New Client
              </button>
            </div>

            {form.clientMode === "existing" ? (
              <Field label="Client" id="clientId" error={errors.clientId} required>
                <select
                  id="clientId"
                  value={form.clientId}
                  onChange={(e) => set("clientId", e.target.value)}
                  className={inputClass(!!errors.clientId)}
                >
                  <option value="">Select a client...</option>
                  {dataset?.clients
                    .filter((c) => c.active)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </Field>
            ) : (
              <>
                <div className="col-span-full -mb-2 text-xs font-semibold tracking-wide text-navy/50 uppercase">
                  New Client Information
                </div>
                <Field label="Client Name" id="newClientName" error={errors.newClientName} required>
                  <input
                    id="newClientName"
                    value={form.newClientName}
                    onChange={(e) => set("newClientName", e.target.value)}
                    className={inputClass(!!errors.newClientName)}
                  />
                </Field>
                <Field label="Client Address" id="newClientAddress" error={errors.newClientAddress} required>
                  <input
                    id="newClientAddress"
                    value={form.newClientAddress}
                    onChange={(e) => set("newClientAddress", e.target.value)}
                    className={inputClass(!!errors.newClientAddress)}
                  />
                </Field>
                <Field label="Client City" id="newClientCity" error={errors.newClientCity} required>
                  <input
                    id="newClientCity"
                    value={form.newClientCity}
                    onChange={(e) => set("newClientCity", e.target.value)}
                    className={inputClass(!!errors.newClientCity)}
                  />
                </Field>
                <Field label="Client State" id="newClientState" error={errors.newClientState} required>
                  <input
                    id="newClientState"
                    value={form.newClientState}
                    onChange={(e) => set("newClientState", e.target.value)}
                    className={inputClass(!!errors.newClientState)}
                  />
                </Field>
                <Field label="Client ZIP" id="newClientZip" error={errors.newClientZip} required>
                  <input
                    id="newClientZip"
                    value={form.newClientZip}
                    onChange={(e) => set("newClientZip", e.target.value)}
                    className={inputClass(!!errors.newClientZip)}
                  />
                </Field>
                <Field label="Client Phone" id="newClientPhone">
                  <input
                    id="newClientPhone"
                    value={form.newClientPhone}
                    onChange={(e) => set("newClientPhone", e.target.value)}
                    className={inputClass(false)}
                  />
                </Field>
                <Field label="Client Email" id="newClientEmail">
                  <input
                    id="newClientEmail"
                    type="email"
                    value={form.newClientEmail}
                    onChange={(e) => set("newClientEmail", e.target.value)}
                    className={inputClass(false)}
                  />
                </Field>
              </>
            )}

            <Field label="Contact First Name" id="contactFirstName">
              <input
                id="contactFirstName"
                value={form.contactFirstName}
                onChange={(e) => set("contactFirstName", e.target.value)}
                className={inputClass(false)}
              />
            </Field>
            <Field label="Contact Last Name" id="contactLastName">
              <input
                id="contactLastName"
                value={form.contactLastName}
                onChange={(e) => set("contactLastName", e.target.value)}
                className={inputClass(false)}
              />
            </Field>
            <Field label="Contact Title" id="contactTitle">
              <input
                id="contactTitle"
                value={form.contactTitle}
                onChange={(e) => set("contactTitle", e.target.value)}
                className={inputClass(false)}
              />
            </Field>
            <Field label="Contact Email" id="contactEmail">
              <input
                id="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
                className={inputClass(false)}
              />
            </Field>
            <Field label="Contact Phone" id="contactPhone">
              <input
                id="contactPhone"
                value={form.contactPhone}
                onChange={(e) => set("contactPhone", e.target.value)}
                className={inputClass(false)}
              />
            </Field>
            <Field label="Owner" id="ownerId">
              <select
                id="ownerId"
                value={form.ownerId}
                onChange={(e) => set("ownerId", e.target.value)}
                className={inputClass(false)}
              >
                <option value="">Not set</option>
                {dataset?.owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Contractor Name" id="contractorName">
              <input
                id="contractorName"
                value={form.contractorName}
                onChange={(e) => set("contractorName", e.target.value)}
                className={inputClass(false)}
                placeholder="If known"
              />
            </Field>
          </Section>

          <Section title="Project Management">
            <Field label="Principal" id="principalEmployeeId">
              <select
                id="principalEmployeeId"
                value={form.principalEmployeeId}
                onChange={(e) => set("principalEmployeeId", e.target.value)}
                className={inputClass(false)}
              >
                <option value="">Not set</option>
                {dataset?.employees
                  .filter((e) => e.role === "Principal" && e.active)
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Project Manager" id="pmEmployeeId">
              <select
                id="pmEmployeeId"
                value={form.pmEmployeeId}
                onChange={(e) => set("pmEmployeeId", e.target.value)}
                className={inputClass(false)}
              >
                <option value="">Not set</option>
                {dataset?.employees
                  .filter((e) => e.active)
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} &mdash; {e.role}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Probability of Winning (%)" id="probability" error={errors.probability}>
              <input
                id="probability"
                value={form.probability}
                onChange={(e) => set("probability", e.target.value.replace(/[^0-9]/g, ""))}
                className={inputClass(!!errors.probability)}
                placeholder="75"
              />
            </Field>
          </Section>

          <Section title="Financial Information">
            <Field label="Fee Structure" id="feeStructureId" error={errors.feeStructureId} required>
              <select
                id="feeStructureId"
                value={form.feeStructureId}
                onChange={(e) => set("feeStructureId", e.target.value)}
                className={inputClass(!!errors.feeStructureId)}
              >
                <option value="">Select...</option>
                {dataset?.lookups.feeStructures.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Service Type" id="serviceTypeId">
              <select
                id="serviceTypeId"
                value={form.serviceTypeId}
                onChange={(e) => set("serviceTypeId", e.target.value)}
                className={inputClass(false)}
              >
                <option value="">Not set</option>
                {dataset?.lookups.serviceTypes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Proposed Fee" id="proposedFee" error={errors.proposedFee} required>
              <CurrencyInput id="proposedFee" value={form.proposedFee} onChange={(v) => set("proposedFee", v)} />
            </Field>
            <Field label="Billing Terms" id="billingTerms">
              <select
                id="billingTerms"
                value={form.billingTerms}
                onChange={(e) => set("billingTerms", e.target.value)}
                className={inputClass(false)}
              >
                <option value="">Not set</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
                <option value="Upon Milestone">Upon Milestone</option>
                <option value="Monthly">Monthly</option>
              </select>
            </Field>
          </Section>

          <Section title="Additional Information">
            <div className="col-span-full">
              <label htmlFor="comments" className="mb-1.5 block text-sm font-medium text-navy">
                Comments
              </label>
              <textarea
                id="comments"
                value={form.comments}
                onChange={(e) => set("comments", e.target.value)}
                rows={4}
                className={inputClass(false)}
                placeholder="Anything else worth noting about this project..."
              />
            </div>
          </Section>

          <div className="flex flex-col-reverse items-stretch gap-3 border-t border-steel/30 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-navy/50">
              {draftSavedAt ? `Draft saved at ${draftSavedAt}` : "Changes are not saved until you save a draft or create the project."}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="button" variant="secondary" onClick={handleSaveDraft}>
                Save Draft
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </div>
        </form>
      </Container>
    </main>
  );
}

function TopBar({ userName, userEmail }: { userName: string; userEmail: string }) {
  return (
    <header className="border-b border-steel/30 bg-white px-6 py-4">
      <Container className="flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-navy/60 sm:inline">
            {userName} &middot; {userEmail}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/70 hover:text-navy"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </form>
        </div>
      </Container>
    </header>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-steel/30 bg-white p-6">
      <legend className="px-1 text-base font-bold text-navy">{title}</legend>
      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  id,
  error,
  required,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-navy">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean): string {
  return `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-navy focus:outline-none ${
    hasError ? "border-red-400 focus:border-red-500" : "border-steel/50 focus:border-teal"
  }`;
}

function CurrencyInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-navy/50">$</span>
      <input
        id={id}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
        className={inputClass(false) + " pl-7"}
        placeholder="0"
      />
    </div>
  );
}
