import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { AllToolsPage } from './pages/AllToolsPage';
import { CategoryPage } from './pages/CategoryPage';
import { ToolRoute } from './pages/ToolRoute';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="tools" element={<AllToolsPage />} />
        <Route path="tools/:slug" element={<ToolRoute />} />
        <Route path="category/:id" element={<CategoryPage />} />
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
