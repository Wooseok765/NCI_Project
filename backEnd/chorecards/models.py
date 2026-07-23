from django.db import models
from commons.models import Common


# Create your models here.
class ChoreCard(Common):
    class DifficultyChoice(models.IntegerChoices):
        point1 = ("1", "1")
        point2 = ("2", "2")
        point3 = ("3", "3")
        point4 = ("4", "4")
        point5 = ("5", "5")
        point6 = ("6", "6")
        point7 = ("7", "7")
        point8 = ("8", "8")
        point9 = ("9", "9")
        point10 = ("10", "10")

    class StatusChoice(models.TextChoices):
        in_progress = ("in_progress", "In Progress")
        overdue = ("overdue", "Overdue")
        completed = ("completed", "Completed")

    title = models.CharField(
        max_length=40,
    )
    household = models.ForeignKey(
        "householdgroups.HouseHoldGroup",
        on_delete=models.CASCADE,
    )
    checklist = models.TextField()
    difficulty_weight = models.PositiveBigIntegerField(
        default=0,
        choices=DifficultyChoice.choices,
    )
    status = models.CharField(
        null=True,
        blank=True,
        max_length=20,
        choices=StatusChoice.choices,
    )
    assignee = models.ManyToManyField(
        "users.User",
    )
    completed_at = models.DateField(
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.title
