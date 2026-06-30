import { createToolRoute } from "@/lib/seo/tool-route";

const { metadata, ToolRouteLayout } = createToolRoute("/pdf-to-word");

export { metadata };
export default ToolRouteLayout;
