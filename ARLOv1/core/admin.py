from django.contrib import admin

from .models import (
    BacklogSnapshot,
    Client,
    Contact,
    DeliveryMethod,
    Discipline,
    Employee,
    FeeStructure,
    Invoice,
    Job,
    JobCost,
    JobFee,
    JobPhase,
    JobStructuralSystem,
    Owner,
    OwnerType,
    Proposal,
    ProjectType,
    ServiceType,
    StructuralSystem,
)

admin.site.register(OwnerType)
admin.site.register(ProjectType)
admin.site.register(Discipline)
admin.site.register(DeliveryMethod)
admin.site.register(StructuralSystem)
admin.site.register(FeeStructure)
admin.site.register(ServiceType)
admin.site.register(Client)
admin.site.register(Contact)
admin.site.register(Owner)
admin.site.register(Employee)
admin.site.register(Proposal)
admin.site.register(Job)
admin.site.register(JobPhase)
admin.site.register(JobCost)
admin.site.register(JobStructuralSystem)
admin.site.register(JobFee)
admin.site.register(Invoice)
admin.site.register(BacklogSnapshot)
