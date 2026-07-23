from uuid import uuid4

from django.db import models
from commons.models import Common


# Create your models here.
class HouseHoldGroup(Common):

    def generate_invite_code():
        return str(uuid4()).upper()  # uuid() retruns unique identifc object

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
        default=generate_invite_code,
        editable=False,
    )
    is_active = models.BooleanField(
        default=True,
    )

    def __str__(self):
        return self.title
