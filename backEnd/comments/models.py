from django.db import models
from commons.models import Common


# Create your models here.
class Comment(Common):
    writer = models.ForeignKey(
        "members.Member",
        on_delete=models.CASCADE,
    )
    choreCard = models.ForeignKey(
        "chorecards.ChoreCard",
        on_delete=models.CASCADE,
    )
    payload = models.TextField()

    def __str__(self):
        return f"{self.writer} / {self.chore}"
