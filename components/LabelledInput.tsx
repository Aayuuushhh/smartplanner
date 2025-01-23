interface LabelledInputType {
    label: string;
    placeholder: string;
    type?: string;
    name?: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function LabelledInput({
    label,
    placeholder,
    type,
    name,
    value,
    onChange,
}: LabelledInputType) {
    return (
        <div>
            <label className="block mb-2 text-m text-black font-semibold pt-4">{label}</label>
            <input
                type={type || "text"}
                name={name}
                value={value}
                onChange={onChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-[20rem] p-2.5"
                placeholder={placeholder}
                required
            />
        </div>
    );
}