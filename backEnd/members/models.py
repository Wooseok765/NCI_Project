from django.db import models
from commons.models import Common


# Create your models here.
class Member(Common):
    class RoleChoice(models.TextChoices):
        owner = ("owner", "Group Owner")
        member = ("member", "Member")

    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
    )
    householdgroup = models.ForeignKey(
        "householdgroups.HouseHoldGroup",
        on_delete=models.CASCADE,
    )
    role = models.CharField(
        max_length=20,
        choices=RoleChoice.choices,
    )
    contribution = models.PositiveIntegerField(
        default=0,
    )
    penalty = models.PositiveIntegerField(
        default=0,
    )
    
    def __str__(self):
        return f"{self.user.username} - {self.householdgroup} / {self.role}"
