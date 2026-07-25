from django.urls import path
from chorecards import views

urlpatterns = [
    path("", views.ChoreCards.as_view()),
    path("<int:pk>/", views.ChoreCardDetail.as_view()),
    path("<int:pk>/complete/", views.ChoreCardComplete.as_view()),
]
