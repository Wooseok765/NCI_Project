from django.db import models
from commons.models import Common


# Create your models here.
class HouseHoldGroup(Common):
    title = models.CharField(
        max_length=140,
    )
    description = models.TextField(
        null=True,
        blank=True,
    )
    invite_code = models.CharField(
        max_length=200,
        unique=True,
    )
    is_active = models.BooleanField(
        default=True,
    )

    def __str__(self):
        return self.title
