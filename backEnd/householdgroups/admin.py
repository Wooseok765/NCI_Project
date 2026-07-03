from django.contrib import admin
from householdgroups.models import HouseHoldGroup
# Register your models here.
@admin.register(HouseHoldGroup)
class HouseHoldGroupAdmin(admin.ModelAdmin):
    list_display=(
        "title",
        "member_count",
        "created_at",
        "updated_at",
    )
    
    def member_count(self, member):
        return member.member_set.count()
    
    member_count.short_description = "Number of members"