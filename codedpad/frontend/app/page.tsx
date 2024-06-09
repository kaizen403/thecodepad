"use client";
import { useState, ChangeEvent, MouseEvent } from "react";

const Home: React.FC = () => {
  const [word, setWord] = useState<string>("");
  const [data, setData] = useState<string>("");
  const [secret, setSecret] = useState<string>(""); // To store the secret key
  const [showTextArea, setShowTextArea] = useState<boolean>(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setWord(event.target.value);
    setData("");
    setShowTextArea(false);
  };

  const handleOpenClick = async (
    event: MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/open", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word }),
      });

      if (response.ok) {
        const responseData = await response.json();
        setData(responseData.data || "");
        setSecret(responseData.secret || ""); // Save the secret key for later use
        setShowTextArea(true);
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setData("Failed to fetch data");
      setShowTextArea(false);
    }
  };

  const handleSaveClick = async (): Promise<void> => {
    try {
      const response = await fetch(`http://localhost:3000/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ secret, data }), // Send the secret along with data
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      setShowTextArea(false); // Hide textarea and save button after successful save
      setData(""); // Optionally clear data
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to update data");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-5xl font-bold text-green-500 mb-4">CodedPad</h1>
        <p className="text-lg text-gray-300">
          The fastest way to save notes anywhere.
        </p>
      </div>
      <div className="flex gap-4">
        <input
          type="text"
          value={word}
          onChange={handleInputChange}
          placeholder="Enter word"
          className="border-2 border-gray-700 bg-gray-800 text-white p-2 rounded-lg focus:outline-none focus:border-green-500"
        />
        <button
          onClick={handleOpenClick}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Open
        </button>
      </div>
      {showTextArea && (
        <>
          <textarea
            className="mt-4 h-32 w-96 p-2 border-2 border-gray-700 bg-gray-800 text-white rounded-lg"
            readOnly={false}
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="Results will appear here..."
          />
          <button
            onClick={handleSaveClick}
            className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Save
          </button>
        </>
      )}
    </div>
  );
};

export default Home;
