import React, { useState } from "react";
import LabelledInput from "./LabelledInput";

interface UserDetailFormProps {
    onSubmit: (data: { firstName: string, lastName: string, displayName: string, phoneNumber: string }) => void;
    loading: boolean;
}

const UserDetailForm: React.FC<UserDetailFormProps> = ({ onSubmit, loading }) => {
    const [formData, setFormData] = useState<{ firstName: string, lastName: string, displayName: string, phoneNumber: string }>({
        firstName: "",
        lastName: "",
        displayName: "",
        phoneNumber: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <LabelledInput
                label="First Name"
                placeholder="Enter your first name"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <LabelledInput
                label="Last Name"
                placeholder="Enter your last name"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
            <LabelledInput
                label="Display Name"
                placeholder="Enter your display name"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            />
            <LabelledInput
                label="Phone Number"
                placeholder="Enter your phone number"
                name="phoneNumber"
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
            <button
                type="submit"
                className="mt-8 w-full text-white bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                disabled={loading} 
            >
                Submit
            </button>
        </form>
    );
};

export default UserDetailForm;