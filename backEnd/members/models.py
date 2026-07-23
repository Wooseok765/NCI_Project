from django.db import models
from commons.models import Common


# Create your models here.
class Member(Common):

    class Meta:  # Prevents duplicate membership, including through Django Admin. Because it works when the created data is being saved to the DB
        constraints = [  # adds extra rule to the Member class
            models.UniqueConstraint(
                fields=(  # The combination of these fields must be unique.
                    "user",
                    "householdgroup",
                ),
                name="duplication_check_for_registration",
                # naming for this duplication check
            )
        ]

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
