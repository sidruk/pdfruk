import { createToolRoute } from "@/lib/seo/tool-route";

const { metadata, ToolRouteLayout } = createToolRoute("/pdf-to-jpg");

export { metadata };
export default ToolRouteLayout;
