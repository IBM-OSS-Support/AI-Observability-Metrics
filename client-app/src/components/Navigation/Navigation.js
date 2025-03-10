/* ******************************************************************************
 * IBM Confidential
 *
 * OCO Source Materials
 *
 *  Copyright IBM Corp. 2024  All Rights Reserved.
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
  SideNavItems,
  SideNavLink,
  Theme
} from '@carbon/react';
import {
  SidePanelOpen,
  SidePanelClose,
  UserAvatar,
  Home,
  ChartBullet,
  Meter,
  CloudAuditing,
  MeterAlt,
  StarReview,
  Security,
  WhitePaper,
  CloudMonitoring,
  AudioConsole,
  WarningAlt
} from '@carbon/react/icons';

// Utils ---------------------------------------------------------------------->

const Navigation = () => {
  const sections = [
    {
      name: 'Group 1',
      links: [
        {
          name: 'Home',
          subpath: '/',
          icon: Home
        },
        {
          name: 'Performance',
          subpath: '/performance',
          icon: Meter
        },
        {
          name: 'Auditing',
          subpath: '/auditing',
          icon: CloudAuditing
        },
        {
          name: 'Traceability',
          subpath: '/traceability',
          icon: ChartBullet
        },
        {
          name: 'Metering & Billing',
          subpath: '/metering',
          icon: MeterAlt
        },
        {
          name: 'Maintenance',
          subpath: '/maintenance',
          icon: AudioConsole // VehicleServices
        },
        // {
        //   name: 'Sessions',
        //   subpath: '/sessions',
        //   icon: Time
        // },
        // {
        //   name: 'Metrics',
        //   subpath: '/metrics',
        //   icon: Activity
        // }
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
            GenAI Observability
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
              {sections.map((s, i) =>
                <Fragment key={s.name}>
                  {s.links.map(l => {
                    let hrefLinks = `#${l.subpath}`;

                    return (
                      <SideNavLink
                        title={l.name}
                        key={l.name}
                        href={hrefLinks}
                        renderIcon={l.icon}
                        isActive={pathname.endsWith(l.subpath)}
                        onClick={(e) => {
                          if (l.disabled) {
                            e.preventDefault();
                            return;
                          }
                          setSideNavOpen(false);
                          document.activeElement.blur();
                        }}
                        disabled={l.disabled}
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
