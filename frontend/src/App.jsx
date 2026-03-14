import { useState } from "react";
import { AllImages } from "./images/AllImages.jsx";
import { ImageDetails } from "./images/ImageDetails.jsx";
import { UploadPage } from "./UploadPage.jsx";
import { LoginPage } from "./LoginPage.jsx";
import { Routes, Route, Navigate } from "react-router";
import { MainLayout } from "./MainLayout.jsx";
import { VALID_ROUTES } from "../../shared/ValidRoutes.js";

function ProtectedRoute({ children, authToken }) {
  if (!authToken) {
    return <Navigate to={VALID_ROUTES.LOGIN} replace />;
  }
  return children;
}

function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem("token"));

  return (
    <Routes>
      <Route path={VALID_ROUTES.HOME} element={<MainLayout />}>
        <Route index element={
          <ProtectedRoute authToken={authToken}>
            <AllImages authToken={authToken} />
          </ProtectedRoute>
        } />
        <Route path={`${VALID_ROUTES.IMAGE_PREFIX}/:imageId`} element={
          <ProtectedRoute authToken={authToken}>
            <ImageDetails authToken={authToken} />
          </ProtectedRoute>
        } />
        <Route path={VALID_ROUTES.UPLOAD} element={
          <ProtectedRoute authToken={authToken}>
            <UploadPage />
          </ProtectedRoute>
        } />
        <Route path={VALID_ROUTES.LOGIN} element={<LoginPage onTokenChange={setAuthToken} />} />
        <Route path={VALID_ROUTES.REGISTER} element={<LoginPage isRegistering={true} onTokenChange={setAuthToken} />} />
      </Route>
    </Routes>
  );
}

export default App;
