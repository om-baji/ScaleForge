"use client"
import React, { FormEvent, ChangeEvent, useState } from "react";
import { confirmation } from "../cognito";
import { useRouter } from "next/navigation";

const Confirmation: React.FC = () => {
  const router = useRouter();
  const [confirmationCode, setConfirmationCode] = useState<string>("");
  const [username, setUsername] = useState<string>(
    typeof window !== "undefined" ? localStorage.getItem("pendingUsername") || "" : ""
  );

  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmationCode(e.target.value);
    setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setButtonLoading(true);
      setError("");

      await confirmation(confirmationCode, username);

      localStorage.removeItem("pendingUsername");
      router.push("/login");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid confirmation code. Please try again.");
    } finally {
      setButtonLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Confirm Your Account</h1>
          <p className="text-gray-600">
            Enter the confirmation code we sent to your email
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmation Code
            </label>
            <input
              className="w-full px-4 py-3 text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
              type="text"
              name="confirmationCode"
              value={confirmationCode}
              onChange={handleChange}
              placeholder="Enter the code"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
            type="submit"
            disabled={buttonLoading}
          >
            {buttonLoading ? "Verifying..." : "Confirm Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Confirmation;
