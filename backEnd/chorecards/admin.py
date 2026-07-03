from django.contrib import admin
from chorecards.models import ChoreCard


# Register your models here.
@admin.register(ChoreCard)
class ChoreCardAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "household",
        "checklist",
        "difficulty_weight",
        "status",
        "completed_at",
    )
