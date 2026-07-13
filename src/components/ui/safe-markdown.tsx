import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

interface SafeMarkdownProps {
  content: string;
}

export function SafeMarkdown({ content }: SafeMarkdownProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSanitize]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
