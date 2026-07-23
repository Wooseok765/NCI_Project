from django.urls import path
from householdgroups import views

urlpatterns = [
    path("", views.HouseHoldGroups.as_view()),
    path("join/", views.JoinHouseHoldGroup.as_view()),
]
