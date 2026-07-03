from django.contrib import admin
from users.models import User
from django.contrib.auth.admin import UserAdmin
# Register your models here.
@admin.register(User)
class UserAdmin(UserAdmin):
    fieldsets = (
        (
            "Profile", {
                "fields":(
                    "first_name",                    
                    "email",
                    "is_owner",
                ),
            },
        ),
    )