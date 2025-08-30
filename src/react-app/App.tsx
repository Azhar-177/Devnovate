import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import HomePage from "@/react-app/pages/Home";
import ArticlePage from "@/react-app/pages/Article";
import CreateArticlePage from "@/react-app/pages/CreateArticle";
import EditArticlePage from "@/react-app/pages/EditArticle";
import ProfilePage from "@/react-app/pages/Profile";
import AdminDashboardPage from "@/react-app/pages/AdminDashboard";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import SearchPage from "@/react-app/pages/Search";
import TrendingPage from "@/react-app/pages/Trending";
import Layout from "@/react-app/components/Layout";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/trending" element={<TrendingPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/article/:slug" element={<ArticlePage />} />
            <Route path="/create" element={<CreateArticlePage />} />
            <Route path="/edit/:id" element={<EditArticlePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
