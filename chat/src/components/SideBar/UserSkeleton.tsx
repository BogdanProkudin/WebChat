import React from 'react';
import ContentLoader, { IContentLoaderProps } from 'react-content-loader';
import { JSX } from 'react/jsx-runtime';

const UserSkeleton = (props: JSX.IntrinsicAttributes & IContentLoaderProps) => (
  <ContentLoader
    speed={2}
    width={400}
    height={100}
    viewBox="0 0 400 100"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    style={{ marginRight: '20px' }}
    {...props}
  >
    <rect x="72" y="53" rx="0" ry="0" width="125" height="32" />
    <rect x="67" y="14" rx="0" ry="0" width="5" height="5" />
    <circle cx="36" cy="68" r="27" />
  </ContentLoader>
);

export default UserSkeleton;
