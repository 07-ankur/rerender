import { Box, Breadcrumbs, Typography, Tooltip, Menu, MenuItem, Popover } from '@mui/material';
import { ChevronRight, ExpandMore, KeyboardArrowRight } from '@mui/icons-material';
import { useState } from 'react';
import { getFileIcon, getFolderIcon } from '../utils/fileIcons';

interface BreadcrumbPath {
  label: string;
  onClick?: () => void;
  isFile?: boolean;
  icon?: string;
  folderContents?: BreadcrumbPath[];
}

interface BreadcrumbProps {
  paths: BreadcrumbPath[];
}

// Recursive menu item component for nested folders
function NestedMenuItem({ item, onClose }: { item: BreadcrumbPath; onClose: () => void }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const hasChildren = !item.isFile && item.folderContents && item.folderContents.length > 0;

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event: React.MouseEvent) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const handleItemClick = (onClick?: () => void) => {
    if (onClick) {
      onClick();
    }
    onClose();
  };

  return (
    <>
      <MenuItem
        onMouseEnter={hasChildren ? handleOpen : undefined}
        onClick={() => handleItemClick(item.onClick)}
        sx={{
          fontSize: '12px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        {item.isFile ? (
          getFileIcon(item.label)
        ) : (
          getFolderIcon()
        )}
        <Typography component="span" sx={{ fontSize: '12px', flex: 1 }}>
          {item.label}
        </Typography>
        {hasChildren && (
          <KeyboardArrowRight sx={{ fontSize: '16px', color: '#858585' }} />
        )}
      </MenuItem>

      {hasChildren && (
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          slotProps={{
            paper: {
              sx: {
                backgroundColor: '#2d2d2d',
                color: '#e8e8e8',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                border: '1px solid #3e3e42',
                maxHeight: '400px',
                overflow: 'auto',
              },
            },
          }}
          onMouseLeave={handleClose}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {item.folderContents!.map((child, idx) => (
              <NestedMenuItem
                key={idx}
                item={child}
                onClose={onClose}
              />
            ))}
          </Box>
        </Popover>
      )}
    </>
  );
}

export default function Breadcrumb({ paths }: BreadcrumbProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  if (!paths || paths.length === 0) {
    return null;
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setAnchorEl(event.currentTarget);
    setOpenMenuIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setOpenMenuIndex(null);
  };

  const handleMenuItemClick = (onClick?: () => void) => {
    if (onClick) {
      onClick();
    }
    handleMenuClose();
  };

  // Build full path for tooltip
  const buildFullPath = () => {
    return paths.map((p) => p.label).join(' / ');
  };

  const fullPath = buildFullPath();
  const isLongPath = fullPath.length > 60;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        backgroundColor: '#1e1e1e',
        borderBottom: '1px solid #3e3e42',
        fontSize: '12px',
        minHeight: '36px',
        gap: '4px',
      }}
    >
      <Breadcrumbs
        separator={<ChevronRight sx={{ fontSize: '16px', color: '#858585', mx: '2px' }} />}
        sx={{
          display: 'flex',
          alignItems: 'center',
          '& ol': {
            display: 'flex',
            alignItems: 'center',
            margin: 0,
            gap: 0,
          },
          '& li': {
            display: 'flex',
            alignItems: 'center',
            minWidth: 0,
          },
        }}
      >
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1;
          const isFirst = index === 0;
          const isFile = path.isFile ?? isLast;
          const hasDropdown = !isFile && path.folderContents && path.folderContents.length > 0;

          return (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip
                title={isLongPath ? path.label : ''}
                placement="bottom"
                slotProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: '#2d2d2d',
                      color: '#e8e8e8',
                      fontSize: '11px',
                      border: '1px solid #3e3e42',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    },
                  },
                }}
              >
                <Box
                  onClick={(e) => {
                    if (hasDropdown) {
                      handleMenuOpen(e, index);
                    } else if (path.onClick) {
                      path.onClick();
                    }
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: hasDropdown ? '2px 4px' : '2px 6px',
                    borderRadius: '3px',
                    cursor: hasDropdown || path.onClick ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    maxWidth: isLast ? '300px' : '150px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      backgroundColor: hasDropdown || path.onClick ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                      color: hasDropdown || path.onClick ? '#e8e8e8' : '#858585',
                    },
                  }}
                >
                  {isFile && !isFirst ? (
                    getFileIcon(path.label)
                  ) : !isFile ? (
                    getFolderIcon()
                  ) : null}

                  <Typography
                    component="span"
                    sx={{
                      color: isLast ? '#cccccc' : '#858585',
                      fontSize: '12px',
                      fontWeight: isLast ? 500 : 400,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {path.label}
                  </Typography>

                  {hasDropdown && (
                    <ExpandMore
                      sx={{
                        fontSize: '16px',
                        marginLeft: '2px',
                        color: '#858585',
                        transition: 'transform 0.2s ease',
                        transform: openMenuIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  )}
                </Box>
              </Tooltip>

              {hasDropdown && (
                <Menu
                  anchorEl={anchorEl}
                  open={openMenuIndex === index}
                  onClose={handleMenuClose}
                  slotProps={{
                    paper: {
                      sx: {
                        backgroundColor: '#2d2d2d',
                        color: '#e8e8e8',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        border: '1px solid #3e3e42',
                        maxHeight: '400px',
                        overflow: 'auto',
                      },
                    },
                  }}
                >
                  {path.folderContents!.map((item, itemIdx) => (
                    <NestedMenuItem
                      key={itemIdx}
                      item={item}
                      onClose={handleMenuClose}
                    />
                  ))}
                </Menu>
              )}
            </Box>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}
