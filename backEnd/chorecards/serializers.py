from rest_framework import serializers
from chorecards.models import ChoreCard


class CreateChoreCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChoreCard
        fields = (
            "title",
            "householdgroup",
            "checklist",
            "difficulty_weight",
            "due_date",
            "assignee",
        )

    def validate(self, data):
        # it runs when .is_valid() runs
        householdgroup = data.get("householdgroup")
        assignees = data.get("assignee", [])
        # the second arguments is a default when there's no vlue named 'assignee'
        # the value of assignee must be list form since it is definded as many to many field

        if not assignees:
            raise serializers.ValidationError(
                {"System": "At least one assignee is required."}
            )

        for assignee in assignees:
            if assignee.householdgroup != householdgroup:
                raise serializers.ValidationError(
                    {"System": f"{assignee} does not belong to the household group"},
                )  # if the member that assigned to the chorecard is not belonged to the group.
        return data


class ChoreCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChoreCard
        fields = "__all__"


class UpdateChoreCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChoreCard
        fields = (
            "title",
            "checklist",
            "difficulty_weight",
            "due_date",
            "assignee",
        )

    def validate(self, data):
        assignees = data.get("assignee")

        # when the owner does not change the assignee
        if assignees is None:
            return data

        # if the assignees is forgotten to choose
        if not assignees:
            raise serializers.ValidationError(
                {"System": "At least one assignee is required"}
            )

        householdgroup = self.instance.householdgroup
        # fetch the group that the card about to edit is enrolled

        for assignee in assignees:
            if assignee.householdgroup != householdgroup:
                raise serializers.ValidationError(
                    {"System": f"{assignee} does not belong to the household group"}
                )  # check if the assignee(member object) is enrolled to the household group that contains the card(user want to edit)

        return data
