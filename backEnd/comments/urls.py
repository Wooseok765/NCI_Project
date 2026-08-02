from django.urls import path

from comments import views

urlpatterns = [
    path("<int:chorecard_pk>/", views.Comments.as_view()),
]
