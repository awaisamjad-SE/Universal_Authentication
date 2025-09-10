# universal_user/permissions.py
from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Only allow owners of an object or admin to access it.
    """
    def has_object_permission(self, request, view, obj):
        return request.user.is_superuser or obj == request.user
