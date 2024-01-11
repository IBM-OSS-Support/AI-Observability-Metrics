/* ******************************************************************************
 * IBM Confidential
 *
 * OCO Source Materials
 *
 *  Copyright IBM Corp. 2023  All Rights Reserved.
 *
 * The source code for this program is not published or otherwise divested
 * of its trade secrets, irrespective of what has been deposited with
 * the U.S. Copyright Office.
 ****************************************************************************** */
import React, {
  Fragment,
  useEffect,
  useState
} from 'react';

// Components ----------------------------------------------------------------->
import {
  Link,
  useLocation
} from 'react-router-dom';
import {
  IconButton,
  Header,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderMenuButton,
  HeaderName,
  SideNav,
  SideNavDivider,
  SideNavItems,
  SideNavLink,
  Theme
} from '@carbon/react';
import {
  DataTable,
  GroupSecurity,
  Home,
  Information,
  Money,
  ParentChild,
  RecentlyViewed,
  SidePanelOpen,
  SidePanelClose,
  Sql,
  UserAvatar,
  Ticket,
  Idea
} from '@carbon/react/icons';

// Utils ---------------------------------------------------------------------->

const Navigation = () => {
  const [openAboutModal, setOpenAboutModal] = useState(false);
  const sections = [
    {
      name: 'Group 1',
      links: [
        {
          name: 'Infrastructure manager',
          subpath: '/infrastructure-manager',
          icon: ParentChild
        },
        {
          name: 'Data manager',
          subpath: '/data-manager',
          icon: DataTable
        },
        {
          name: 'Query workspace',
          subpath: '/query-workspace',
          icon: Sql
        },
        {
          name: 'Query history',
          subpath: '/query-history',
          icon: RecentlyViewed
        }
      ]
    },
    {
      name: 'Group 2',
      links: [
        {
          name: 'Access control',
          subpath: '/access-control',
          icon: GroupSecurity
        },
        {
          name: 'Billing and usage',
          subpath: '/billing-and-usage',
          icon: Money
        }
      ]
    },
    {
      name: 'Group 3',
      links: [
        {
           name: 'seperator',
        },
      ]
    },
    {
      name: 'Group 4',
      links: [
        {
          name: 'Instance details',
          onClick: () => setOpenAboutModal(true),
          icon: Information
        },
        {
          name: 'Requests',
          subpath: '/requests',
          href: 'https://ibm-data-and-ai.ideas.ibm.com/',
          icon: Idea
        },
        {
          name: 'Support',
          subpath: '/support',
          href: 'https://cloud.ibm.com/login?redirect=%2Funifiedsupport%2Fsupportcenter',
          icon: Ticket
        }
      ]
    }
  ];

  const { pathname } = useLocation();
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const clickHandler = event => {
      // Close side nav if click is outside of it or header menu button
      if (sideNavOpen) {
        const sideNav = document.getElementById('side-nav');
        const leftNavExpandButton = document.getElementById('left-nav-expand-button');

        if (!!sideNav) {
          let isClickOutside = !sideNav.contains(event.target) && !!leftNavExpandButton && (leftNavExpandButton.id !== event.target.id);

          if (isClickOutside) {
            setSideNavOpen(false);
          }
        }
      }
    };

    window.addEventListener('click', clickHandler);
    return () => window.removeEventListener('click', clickHandler);
  }, [sideNavOpen]);

  // Render
  return (
    <>
      <Theme theme="g100">
        <Header
          aria-label="IBM watsonx.data"
          className={`navigation ${window.LH_CONTEXT}`}
        >
          <HeaderMenuButton
            aria-label={'Global navigation'}
            id="header-menu-button"
            isActive={sideNavOpen}
            onClick={event => {
              event.preventDefault();

              setSideNavOpen(prev => !prev);
            }}
          />
          <HeaderName
            element={Link}
            to={'/'}
            prefix="IBM"
          >
            watsonx.data
          </HeaderName>
          <SideNav
            id="side-nav"
            aria-label={'Side navigation'}
            expanded={sideNavOpen}
            className={sideNavOpen ? 'open' : ''}
            isRail
          >
            {window.LH_CONTEXT === 'sw_ent' ? (
              <IconButton
                id='left-nav-expand-button'
                key={sideNavOpen}
                className="expand-button"
                size="lg"
                kind="ghost"
                renderIcon={() => sideNavOpen ? <SidePanelClose /> : <SidePanelOpen />}
                iconDescription={sideNavOpen ? 'Collapse navigation' : 'Expand navigation'}
                align={sideNavOpen ? 'left' : 'right'}
                enterDelayMs={0}
                leaveDelayMs={0}
                aria-label={sideNavOpen ? 'Collapse navigation' : 'Expand navigation'}
                label={sideNavOpen ? 'Collapse navigation' : 'Expand navigation'}
                onClick={event => {
                  event.preventDefault();

                  setSideNavOpen(prev => !prev);
                }}
              />
            ) : <Fragment />}
            <SideNavItems id='navBar'>
              <SideNavLink
                title={'Home'}
                renderIcon={Home}
                element={Link}
                to={'/home'}
                isActive={pathname.endsWith('/') || pathname.endsWith('/home')}
                onClick={() => {
                  setSideNavOpen(false);
                  document.activeElement.blur();
                }}
              >
                {'Home'}
              </SideNavLink>
              {sections.map((s, i) =>
                <Fragment key={s.name}>
                  {i !== 2 && 
                    <SideNavDivider />
                  }
                  {s.links.map(l => {
                    if (l.name === 'Instance details') {
                      return (
                        <SideNavLink
                          title={l.name}
                          key={l.name}
                          renderIcon={l.icon}
                          onClick={() => {
                            l.onClick();
                            setSideNavOpen(false);
                            document.activeElement.blur();
                          }}
                          className="instance-details"
                        >
                          {l.name}
                        </SideNavLink>
                      );
                    }

                    // For other links, include href, subpath, and other attributes
                    let hrefLinks;
                    const newTab = ['/requests', '/support'].includes(l.subpath) ? '_blank' : '_self';

                    if (['/requests', '/support'].includes(l.subpath)) {
                      hrefLinks = l.href;
                    } else {
                      hrefLinks = `#${l.subpath}`;
                    }

                    return (
                      <SideNavLink
                        title={l.name}
                        key={l.name}
                        href={hrefLinks}
                        target={newTab}
                        renderIcon={l.icon}
                        isActive={pathname.endsWith(l.subpath)}
                        onClick={() => {
                          setSideNavOpen(false);
                          document.activeElement.blur();
                        }}
                      >
                        {l.name}
                      </SideNavLink>
                    );
                  })}
                </Fragment>
              )}
            </SideNavItems>
          </SideNav>
          <HeaderGlobalBar>
            <HeaderGlobalAction
              id="user-profile-trigger-button"
              className={`profile-trigger-button ${profileOpen ? 'open' : ''}`}
              aria-label={'Profile'}
              align="bottom-right"
              onClick={event => {
                event.stopPropagation();

                setSideNavOpen(false);
              }}
              enterDelayMs={0}
              leaveDelayMs={0}
            >
              <UserAvatar size={20} />
            </HeaderGlobalAction>
          </HeaderGlobalBar>
        </Header>
      </Theme>
    </>
  );
};

export default Navigation;
