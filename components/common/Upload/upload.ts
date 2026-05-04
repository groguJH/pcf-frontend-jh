import styled from "styled-components";
import { Upload as AntdUpload } from "antd";
import type { UploadProps } from "antd";

export type { UploadProps };

export const Upload = styled(AntdUpload)<UploadProps>`
  display: inline-flex;

  .ant-upload {
    display: inline-flex;
  }
`;
