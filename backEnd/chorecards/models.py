from django.db import models
from commons.models import Common


# Create your models here.
class ChoreCard(Common):
    class DifficultyChoice(models.IntegerChoices):
        point1 = (1, "1")
        point2 = (2, "2")
        point3 = (3, "3")
        point4 = (4, "4")
        point5 = (5, "5")
        point6 = (6, "6")
        point7 = (7, "7")
        point8 = (8, "8")
        point9 = (9, "9")
        point10 = (10, "10")

    class StatusChoice(models.TextChoices):
        IN_PROGRESS = (
            "in_progress",
            "In Progress",
        )
        OVERDUE = (
            "overdue",
            "Overdue",
        )
        COMPLETED = (
            "completed",
            "Completed",
        )

    title = models.CharField(
        max_length=40,
    )
    householdgroup = models.ForeignKey(
        "householdgroups.HouseHoldGroup",
        on_delete=models.CASCADE,
    )
    checklist = models.TextField()
    difficulty_weight = models.PositiveBigIntegerField(
        choices=DifficultyChoice.choices,
    )
    status = models.CharField(
        max_length=20,
        choices=StatusChoice.choices,
        default=StatusChoice.IN_PROGRESS,
    )
    assignee = models.ManyToManyField(
        "members.Member",
    )  # The assignee should be chosen among the member, not out of the whole users
    due_date = models.DateField(
        null=True,
        blank=True,
    )
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.title
