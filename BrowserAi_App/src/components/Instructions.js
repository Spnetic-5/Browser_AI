import React from 'react';
import '../styles/extension.css';

// FUTURE SCOPE 

const ExtensionInstall = () => {
  return (
    <div className="extension-page-container flex justify-center items-center">
      <div className="extension-page-content">
        <h1 className="extension-page-title text-2xl font-bold mb-4">Welcome to our extension Page</h1>
        <p className="extension-page-instructions mb-4">
          Thank you for visiting our website. To get started, please follow the instructions below to install our Chrome extension:
        </p>
        <ol className="extension-page-instructions list-decimal ml-6 mb-6">
          <li className="mb-2">Open the Chrome browser on your computer.</li>
          <li className="mb-2">Go to the Chrome Web Store.</li>
          <li className="mb-2">Search for "Our Awesome Extension".</li>
          <li className="mb-2">Click on the "Add to Chrome" button.</li>
          <li className="mb-2">Follow the on-screen instructions to install the extension.</li>
        </ol>
        <p className="extension-page-footer text-gray-500">Enjoy using our extension! If you need any assistance, feel free to contact us.</p>
      </div>
    </div>
  );
};

export default ExtensionInstall;
