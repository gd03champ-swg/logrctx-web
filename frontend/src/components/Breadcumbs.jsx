// Breadcrumb component that dynamically updates based on the current path
import { BrowserRouter as Link, useLocation } from 'react-router-dom';

export const Breadcrumbs = () => {
    const location = useLocation();
    const pathSnippets = location.pathname.split('/').filter(i => i);
    
    const breadcrumbItems = [
      <Link to="/" key="dashboard">logrctx</Link>,
      ...pathSnippets.map((_, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        return (
          <Link to={url} key={url}>
            {pathSnippets[index]}
          </Link>
        );
      })
    ];
  
    return (
      <div style={{ margin: '16px', marginTop: '16px', marginLeft: '32px' }}>
        {breadcrumbItems.map((item, index) => (
          <span key={index}>
            {item} {index < breadcrumbItems.length - 1 && '/ '}
          </span>
        ))}
      </div>
    );
  };