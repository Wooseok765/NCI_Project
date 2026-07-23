from django.urls import path
from users import views

urlpatterns = [
    path("signup/", views.SignUp.as_view()),
    # as_view() converts the SignUp class useable by Django
    # When Post http request come through the url(api/v1/users/signup/, Django runs SignUp class)
    path("login/", views.Login.as_view()),
    path("me/", views.Me.as_view()),
    path("logout", views.LogOut.as_view()),
]
