# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser
from django.contrib.admin.widgets import AdminTextareaWidget
from django.db import models




class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = (
        'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'short_conversation_history')
    list_filter = ('is_staff', 'is_active', 'groups')
    ordering = ('username',)
    search_fields = ('username', 'email', 'first_name', 'last_name')

    # Override the form field for JSONField
    formfield_overrides = {
        models.JSONField: {'widget': AdminTextareaWidget},
    }

    fieldsets = (
        (None, {'fields': ('username', 'password', 'conversation_history')}),
        ('Personal info', {'fields': ('email', 'first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'is_staff', 'is_active')}
         ),
    )

    def short_conversation_history(self, obj):
        # Limit the displayed length of the JSON data
        return str(obj.conversation_history)[:50] + "..." if obj.conversation_history else "No history"

    short_conversation_history.short_description = 'Conversation History'


admin.site.register(CustomUser, CustomUserAdmin)
