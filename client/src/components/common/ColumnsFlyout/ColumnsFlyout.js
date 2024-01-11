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
  useEffect,
  useState,
  useMemo
} from 'react';

// Components ----------------------------------------------------------------->
import {
  Button,
  IconButton,
  Checkbox,
  FormLabel
} from '@carbon/react';
import {
  Column,
  Reset
} from '@carbon/react/icons';

// Utils ---------------------------------------------------------------------->
import { injectIntl } from 'react-intl';


const ColumnsFlyout = ({
  intl: { formatMessage },

  id,
  className = '',
  buttonOverrides,
  columns = [],
  setColumns = () => null,
  reset = () => null
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const clickHandler = event => {
      // Close filter if click is outside of it
      if (open) {
        const columnsFlyout = document.getElementById(id);

        if (!!columnsFlyout && !columnsFlyout.contains(event.target)) {
          setOpen(false);
        }
      }
    };

    const escapeHandler = event => {
      if (event.keyCode === 27 && open) {
        setOpen(false);
      }
    };

    window.addEventListener('click', clickHandler);
    window.addEventListener('keydown', escapeHandler);
    return () => {
      window.removeEventListener('click', clickHandler);
      window.removeEventListener('keydown', escapeHandler);
    };
  }, [id, open, setOpen]);


  // Render
  const { checked, total } = useMemo(() => {
    let checked = 0;
    let total = 0;

    columns.forEach(c => {
      if (c.checked) {
        checked++;
      }

      if (c.header) {
        total++;
      }
    });

    return { checked, total };
  }, [columns]);

  return !!id && (
    <div
      id={id}
      className={`columns ${className} ${open ? 'flyout' : ''}`}
    >
      <div className="button-wrapper">
        <IconButton
          tabIndex={!open ? 0 : -1}
          className={`${open ? 'open' : ''}`}
          size="lg"
          kind="ghost"
          renderIcon={Column}
          iconDescription={formatMessage({
            id: 'ColumnsFlyout.customizeIcon',
            defaultMessage: 'Customize'
          })}
          label={formatMessage({
            id: 'ColumnsFlyout.customizeColumns',
            defaultMessage: 'Customize columns'
          })}
          align="top-right"
          enterDelayMs={0}
          leaveDelayMs={0}
          {...buttonOverrides}
          onClick={() => setOpen(prev => {
            if (!prev === true) {
              setTimeout(() => {
                const columnsFlyout = document.getElementById(id);
                const focusableElements = columnsFlyout.querySelectorAll('input:not([disabled])');
  
                if (focusableElements[0]) {
                  focusableElements[0].focus();
                }
              }, 10);
            }

            return !prev;
          })}
        />
      </div>
      {open &&
        <div className="flyout-panel">
          <div className="flyout-panel-content">
            <h6>
              {formatMessage({
                id: 'ColumnsFlyout.customizeColumns',
                defaultMessage: 'Customize columns'
              })}
            </h6>
            <FormLabel>
              {formatMessage({
                id: 'ColumnsFlyout.columns',
                defaultMessage: 'Columns'
              })} ({checked}/{total})
            </FormLabel>
            {columns.map(c => {
              if (c.header) {
                return (
                  <Checkbox
                    tabIndex={open ? 0 : -1}
                    key={`${id}-${c.key}`}
                    id={`${id}-${c.key}`}
                    labelText={c.header}
                    disabled={c.required}
                    checked={c.checked}
                    onChange={(event, { checked }) => setColumns(prev =>
                      prev.map(p => {
                        if (p.key === c.key) {
                          p.checked = checked;
                        }

                        return p;
                      })
                    )}
                  />
                );
              }

              return null;
            })}
          </div>
          <Button
            tabIndex={open ? 0 : -1}
            className="reset-button"
            size="lg"
            kind="secondary"
            renderIcon={Reset}
            iconDescription={formatMessage({
              id: 'ColumnsFlyout.reset',
              defaultMessage: 'Reset'
            })}
            onClick={() => reset()}
          >
            {formatMessage({
              id: 'ColumnsFlyout.reset',
              defaultMessage: 'Reset'
            })}
          </Button>
        </div>
      }
    </div>
  );
};

export default injectIntl(ColumnsFlyout);
