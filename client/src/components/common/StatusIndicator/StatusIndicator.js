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
import { useContext } from 'react';

// Components ----------------------------------------------------------------->
import {
  CheckmarkFilled,
  CheckmarkOutline,
  CheckmarkOutlineWarning,
  CircleDash,
  InProgress,
  PauseOutline,
  Pending,
  Unknown,
  Warning,
  ChangeCatalog
} from '@carbon/react/icons';
import { StatusIcon } from '@carbon/ibm-products';

// Utils ---------------------------------------------------------------------->
import { get } from 'lodash';
import { observer } from 'mobx-react-lite';
import { Context } from '../../state/store';
import { injectIntl } from 'react-intl';

// Globals -------------------------------------------------------------------->
import GLOBAL_MESSAGES from '../../constants/global-messages';

const MAP = {
  component: {
    Failed: 'critical',
    Paused: 'paused',
    Pausing: 'pending',
    Pending: 'pending',
    Provisioning: 'pending',
    Queryable: 'queryable',
    'Queryable, deactivation pending': 'pending',
    'Queryable, sync in progress': 'syncing',
    'Queryable, sync successful': 'sync-success',
    'Queryable, sync partially successful': 'sync-partial-success',
    'Queryable, sync failed': 'sync-failed',
    Registered: 'engine-running',
    'Restart scheduled': 'pending',
    Restarting: 'pending',
    Resuming: 'pending',
    Running: 'engine-running',
    Scaling: 'pending',
    Updating: 'pending',
    Unknown: 'unknown',
    Unqueryable: 'unqueryable',
    'Unqueryable, activation pending': 'pending',
    'Unqueryable, activation required': 'unqueryable'
  },
  query: {
    ACCEPTED: 'in-progress',
    BLOCKED: 'major-warning',
    FAILED: 'critical',
    FINISHED: 'normal',
    PLANNING: 'pending',
    QUEUED: 'pending',
    RUNNING: 'query-running',
    STARTING: 'query-running',
    STOPPED: 'major-warning',
    UNKNOWN: 'unknown',
    WAITING: 'pending'
  },
  connection: {
    Untested: 'unknown',
    'Successful': 'normal',
    'Failed': 'critical'
  }
};

const EXTENSIONS = {
  'paused': {
    icon: PauseOutline,
    color: 'var(--gray-primary)'
  },
  'pending': {
    icon: Pending,
    color: 'var(--gray-primary)'
  },
  'queryable': {
    icon: CheckmarkFilled,
    color: 'var(--gray-primary)'
  },
  'query-running': {
    icon: InProgress,
    color: 'var(--blue-primary)'
  },
  'engine-running': {
    icon: CheckmarkFilled,
    color: 'var(--gray-primary)'
  },
  'service-running': {
    icon: CheckmarkFilled,
    color: 'var(--teal-primary)'
  },
  'syncing': {
    icon: ChangeCatalog,
    color: 'var(--purple-primary)'
  },
  'sync-success': {
    icon: CheckmarkOutline,
    color: 'var(--purple-primary)'
  },
  'sync-partial-success': {
    icon: CheckmarkOutlineWarning,
    color: 'var(--purple-primary)'
  },
  'sync-failed': {
    icon: Warning,
    color: 'var(--purple-primary)'
  },
  'unknown': {
    icon: Unknown,
    color: 'var(--gray-primary)'
  },
  'unqueryable': {
    icon: CircleDash,
    color: 'var(--gray-primary)'
  },
};


const StatusIndicator = ({
  intl: { 
    formatMessage
  },

  className,
  status,
  type,
  subType,
  overrides
}) => {
  const {
    currentUserStore: {
      currentUser: {
        preferences: { theme }
      }
    }
  } = useContext(Context);


  // Render
  if (!status || !type) {
    return null;
  }

  const mapped = get(MAP, [type, status]) || 'unknown';

  let icon;
  if (!!EXTENSIONS[mapped]) {
    const Icon = EXTENSIONS[mapped].icon;

    icon = (
      <Icon
        style={{ color: EXTENSIONS[mapped].color }}
        className={subType ? `${subType}-${status?.toLowerCase()}` : ''}
        {...overrides}
      />
    );
  } else {
    icon = (
      <StatusIcon
        theme={theme}
        size="sm"
        kind={mapped}
        iconDescription={status}
        title={status}
        {...overrides}
      />
    );
  }

  return (
    <div className={`status-indicator ${className || ''}`}>
      <div
        className="icon"
        title={status}
      >
        {icon}
      </div>
      <span 
        className="truncate"
        title={status}
      >
        {!!GLOBAL_MESSAGES[status] ? formatMessage(GLOBAL_MESSAGES[status]) : status}
      </span>
    </div>
  );
};

export default injectIntl(observer(StatusIndicator));
