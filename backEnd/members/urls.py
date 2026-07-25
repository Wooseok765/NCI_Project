from django.urls import path
from members import views

urlpatterns = [
    path("<int:householdgroup_pk>/", views.HouseholdGroupMembers.as_view()),
]
