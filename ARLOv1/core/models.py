from django.db import models


# --- Lookup tables ---------------------------------------------------------

class OwnerType(models.Model):
    owner_type_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.owner_type_name


class ProjectType(models.Model):
    parent_type = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="subtypes",
    )
    project_type_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.project_type_name


class Discipline(models.Model):
    discipline_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.discipline_name


class DeliveryMethod(models.Model):
    delivery_method_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.delivery_method_name


class StructuralSystem(models.Model):
    system_name = models.CharField(max_length=100)
    category = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.system_name


class FeeStructure(models.Model):
    fee_structure_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.fee_structure_name


class ServiceType(models.Model):
    service_type_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.service_type_name


# --- Core tables ------------------------------------------------------------

class Client(models.Model):
    client_name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2)
    zip = models.CharField(max_length=10)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    payment_terms = models.CharField(max_length=50, blank=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.client_name


class Contact(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="contacts")
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    title = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    is_point_of_contact = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Owner(models.Model):
    owner_type = models.ForeignKey(OwnerType, on_delete=models.PROTECT, related_name="owners")
    owner_name = models.CharField(max_length=255)
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.owner_name


class Employee(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    bill_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cost_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Proposal(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Won", "Won"),
        ("Lost", "Lost"),
        ("Withdrawn", "Withdrawn"),
    ]

    client = models.ForeignKey(Client, on_delete=models.PROTECT, related_name="proposals")
    owner = models.ForeignKey(Owner, on_delete=models.SET_NULL, null=True, blank=True, related_name="proposals")
    project_type = models.ForeignKey(ProjectType, on_delete=models.PROTECT, related_name="proposals")
    proposal_date = models.DateField()
    project_name = models.CharField(max_length=255)
    est_construction_cost = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    proposed_fee = models.DecimalField(max_digits=14, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    decision_date = models.DateField(null=True, blank=True)
    loss_reason = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.project_name


class Job(models.Model):
    WORK_TYPE_CHOICES = [
        ("New Construction", "New Construction"),
        ("Renovation", "Renovation"),
        ("Addition", "Addition"),
        ("Assessment", "Assessment"),
    ]
    STATUS_CHOICES = [
        ("Active", "Active"),
        ("On Hold", "On Hold"),
        ("Complete", "Complete"),
        ("Cancelled", "Cancelled"),
    ]
    COMPLEXITY_CHOICES = [(i, str(i)) for i in range(1, 6)]

    job_number = models.CharField(max_length=50, unique=True)
    job_name = models.CharField(max_length=255)
    proposal = models.ForeignKey(Proposal, on_delete=models.SET_NULL, null=True, blank=True, related_name="jobs")
    client = models.ForeignKey(Client, on_delete=models.PROTECT, related_name="jobs")
    contact = models.ForeignKey(Contact, on_delete=models.SET_NULL, null=True, blank=True, related_name="jobs")
    owner = models.ForeignKey(Owner, on_delete=models.PROTECT, related_name="jobs")
    project_type = models.ForeignKey(ProjectType, on_delete=models.PROTECT, related_name="jobs")
    discipline = models.ForeignKey(Discipline, on_delete=models.PROTECT, related_name="jobs")
    delivery_method = models.ForeignKey(DeliveryMethod, on_delete=models.PROTECT, related_name="jobs")
    pm_employee = models.ForeignKey(Employee, on_delete=models.PROTECT, related_name="jobs")
    work_type = models.CharField(max_length=30, choices=WORK_TYPE_CHOICES)
    complexity = models.IntegerField(choices=COMPLEXITY_CHOICES)
    job_address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2)
    zip = models.CharField(max_length=10)
    size = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    size_unit = models.CharField(max_length=30, blank=True)
    construction_cost = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Active")
    start_date = models.DateField()
    est_end_date = models.DateField()
    actual_end_date = models.DateField(null=True, blank=True)

    structural_systems = models.ManyToManyField(
        StructuralSystem, through="JobStructuralSystem", related_name="jobs"
    )

    def __str__(self):
        return f"{self.job_number} — {self.job_name}"


class JobPhase(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="phases")
    phase_name = models.CharField(max_length=100)
    budget_hours = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    budget_cost = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    percent_complete = models.DecimalField(max_digits=5, decimal_places=4, null=True, blank=True)

    def __str__(self):
        return f"{self.job.job_number} — {self.phase_name}"


class JobCost(models.Model):
    COST_TYPE_CHOICES = [
        ("Labor", "Labor"),
        ("Subconsultant", "Subconsultant"),
        ("Reimbursable Expense", "Reimbursable Expense"),
    ]

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="costs")
    phase = models.ForeignKey(JobPhase, on_delete=models.SET_NULL, null=True, blank=True, related_name="costs")
    cost_type = models.CharField(max_length=30, choices=COST_TYPE_CHOICES)
    cost_date = models.DateField()
    hours = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    source_ref = models.CharField(max_length=100, blank=True)
    employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name="costs")

    def __str__(self):
        return f"{self.job.job_number} — {self.cost_type} ({self.cost_date})"


class JobStructuralSystem(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    structural_system = models.ForeignKey(StructuralSystem, on_delete=models.CASCADE)
    is_primary = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["job", "structural_system"], name="unique_job_structural_system"
            )
        ]

    def __str__(self):
        return f"{self.job.job_number} — {self.structural_system.system_name}"


class JobFee(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="fees")
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.PROTECT, related_name="job_fees")
    service_type = models.ForeignKey(ServiceType, on_delete=models.PROTECT, related_name="job_fees")
    fee_amount = models.DecimalField(max_digits=14, decimal_places=2)
    fee_percent = models.DecimalField(max_digits=6, decimal_places=4, null=True, blank=True)
    is_change_order = models.BooleanField(default=False)
    effective_date = models.DateField()
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.job.job_number} — {self.fee_amount}"


class Invoice(models.Model):
    STATUS_CHOICES = [
        ("Draft", "Draft"),
        ("Sent", "Sent"),
        ("Paid", "Paid"),
        ("Void", "Void"),
    ]

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="invoices")
    invoice_number = models.CharField(max_length=50)
    invoice_date = models.DateField()
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Draft")
    paid_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.job.job_number} — {self.invoice_number}"


class BacklogSnapshot(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="backlog_snapshots")
    snapshot_date = models.DateField()
    contract_value = models.DecimalField(max_digits=14, decimal_places=2)
    billed_to_date = models.DecimalField(max_digits=14, decimal_places=2)
    remaining_value = models.DecimalField(max_digits=14, decimal_places=2)
    projected_completion = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.job.job_number} — {self.snapshot_date}"
