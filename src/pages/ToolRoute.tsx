import { Navigate, useParams } from 'react-router-dom';
import { getTool } from '../registry';
import { ToolPage } from '../components/ToolPage';

/** /tools/:slug → resolve the tool from the registry and render its page. */
export function ToolRoute() {
  const { slug = '' } = useParams();
  const tool = getTool(slug);
  if (!tool) return <Navigate to="/404" replace />;
  return (
    <ToolPage tool={tool}>
      <tool.component />
    </ToolPage>
  );
}
