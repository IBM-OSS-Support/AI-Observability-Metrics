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
  useState
} from 'react';

// Components ----------------------------------------------------------------->
import {
  Button,
  IconButton,
  Checkbox,
  DatePicker,
  DatePickerInput,
  FormLabel,
  Layer
} from '@carbon/react';
import {
  Filter,
  FilterReset
} from '@carbon/react/icons';
import { EmptyState } from '@carbon/ibm-products';

// Utils ---------------------------------------------------------------------->
import {
  defineMessage,
  injectIntl
} from 'react-intl';
import Moment from 'moment';

// Globals -------------------------------------------------------------------->
import FILTER_MAP from '../../constants/global-messages';

const filter = defineMessage({
  id: 'FilterFlyout.filter',
  defaultMessage: 'Filter'
});

const FilterFlyout = ({
  intl: { formatMessage },

  id,
  className = '',
  buttonOverrides,
  filters = [],
  selectedFilters = {},
  setSelectedFilters = () => null,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  hasDateRange,
  dateLabel
}) => {
  const [open, setOpen] = useState(false);
  const dateFormatStyle = 'MM/DD/YYYY';

  useEffect(() => {
    const clickHandler = event => {
      if (open) {
        const filterFlyout = document.getElementById(id);
        if (!!filterFlyout && !filterFlyout.contains(event.target)) {
          if (
            ['flatpickr-next-month', 'flatpickr-prev-month', 'arrowUp', 'arrowDown'].some(className =>
              event.target.classList.contains(className)
            )
          ) {
            return;
          }
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
  const noFilters = !filters?.some(f => 
    Object.keys(f?.checkboxes)?.length
  );

  return !!id && (
    <div
      id={id}
      className={`filter ${className} ${open ? 'flyout' : ''}`}
    >
      <div className="button-wrapper">
        <IconButton
          id={`${id}-trigger-button`}
          tabIndex={!open ? 0 : -1}
          className={`${open ? 'open' : ''}`}
          size="lg"
          kind="ghost"
          renderIcon={Filter}
          iconDescription={formatMessage(filter)}
          label={formatMessage(filter)}
          enterDelayMs={0}
          leaveDelayMs={0}
          {...buttonOverrides}
          onClick={() => setOpen(prev => {
            if (!prev === true) {
              setTimeout(() => {
                const filterFlyout = document.getElementById(id);
                const focusableElements = filterFlyout.querySelectorAll('input, button');
  
                if (focusableElements[0] && focusableElements[0]?.id !== `${id}-trigger-button`) {
                  focusableElements[0].focus();
                } else {
                  focusableElements[1]?.focus();
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
              {formatMessage(filter)}
            </h6>
            {!!filters && Array.isArray(filters) && filters.map(({
              formLabel,
              key,
              checkboxes
            }) =>
              <>
                {!!Object.entries(checkboxes).length && (
                  <>
                    <FormLabel>
                      {formLabel}
                    </FormLabel>
                    {Object.entries(checkboxes).map(([labelText, count]) => {
                      const label = FILTER_MAP[labelText] ? formatMessage(FILTER_MAP[labelText]) : labelText;
                      return (
                        <Checkbox
                          tabIndex={open ? 0 : -1}
                          key={`${id}-${labelText}`}
                          id={`${id}-${labelText}`}
                          labelText={`${label} (${count})`}
                          checked={selectedFilters[key]?.includes(labelText) ? true : false}
                          onChange={(event, { checked }) => {
                            if (!checked) {
                              setSelectedFilters({
                                ...selectedFilters,
                                [key]: selectedFilters[key]?.filter(f => f !== labelText)
                              });
                            } else {
                              const newSelectedFilters = { ...selectedFilters };

                              if (!newSelectedFilters[key]) {
                                newSelectedFilters[key] = [labelText];
                              } else {
                                newSelectedFilters[key] = newSelectedFilters[key].concat([labelText]);
                              }

                              setSelectedFilters(newSelectedFilters);
                            }
                          }}
                        />
                      );
                    })}
                  </>
                )}
              </>
            )}
            {!!hasDateRange && !noFilters && (
              <Layer className='top-padding'>
                <FormLabel>
                  {dateLabel}
                </FormLabel>
                <DatePicker
                  key={startDate}
                  datePickerType="range"
                  onChange={(date) => {
                    date[0] && setStartDate(Moment(new Date(date[0])).format(dateFormatStyle));
                    date[1] && setEndDate(Moment(new Date(date[1])).format(dateFormatStyle));
                  }}
                >
                  <DatePickerInput 
                    id="date-picker-input-id-start" 
                    placeholder="mm/dd/yyyy" 
                    size="xs" 
                    value={startDate}
                  />
                  <DatePickerInput 
                    id="date-picker-input-id-finish" 
                    placeholder="mm/dd/yyyy" 
                    value={endDate}
                    size="xs" 
                  />
                </DatePicker>
              </Layer>
            )}
            {noFilters &&
              <EmptyState
                subtitle={formatMessage({
                  id: 'FilterFlyout.emptyState',
                  defaultMessage: 'No filters available yet.'
                })}
              />
            }
          </div>
          <Button
            tabIndex={open ? 0 : -1}
            className="reset-button"
            size="lg"
            kind="secondary"
            renderIcon={FilterReset}
            iconDescription={formatMessage({
              id: 'FilterFlyout.reset',
              defaultMessage: 'Reset'
            })}
            onClick={() => {
              setSelectedFilters({});
              if (hasDateRange) {
                setStartDate(undefined);
                setEndDate(undefined);
              }
            }}
          >
            {formatMessage({
              id: 'FilterFlyout.reset',
              defaultMessage: 'Reset'
            })}
          </Button>
        </div>
      }
    </div>
  );
};

export default injectIntl(FilterFlyout);
