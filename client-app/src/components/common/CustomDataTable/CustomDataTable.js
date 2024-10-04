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
import React from 'react';

// Components ----------------------------------------------------------------->
import {
  Button,
  DataTable,
  DataTableSkeleton,
  FormLabel,
  IconButton,
  Link,
  OverflowMenu,
  OverflowMenuItem,
  Pagination,
  Slider,
  Tag,
  Toggletip,
  ToggletipButton,
  ToggletipContent,
} from '@carbon/react';
import {
  Document,
  Download,
  Movement,
  OverflowMenuVertical,
  Renew
} from '@carbon/react/icons';
import {
  NoDataEmptyState,
  NotFoundEmptyState
} from '@carbon/ibm-products';
import ColumnsFlyout from '../ColumnsFlyout';
import StatusIndicator from '../StatusIndicator';
import FilterFlyout from '../FilterFlyout';

// Utils ---------------------------------------------------------------------->
import Moment from 'moment';

// Globals -------------------------------------------------------------------->
const {
  Table,
  TableBatchAction,
  TableBatchActions,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableSelectAll,
  TableSelectRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  TableHeader
} = DataTable;

// Custom sort function to deal with different cell.value formats
const sortRow = (cellA, cellB, { sortDirection, sortStates }) => {
  const dataA = cellA?.data || cellA;
  const dataB = cellB?.data || cellB;

  if (!dataA) {
    return 1;
  }

  if (!dataB) {
    return -1;
  }

  if (sortDirection === sortStates.DESC) {
    if (typeof dataB === 'number' && typeof dataA === 'number') {
      return dataB - dataA;
    }

    return dataB.toString().toLowerCase().localeCompare(dataA.toString().toLowerCase());
  }

  if (typeof dataA === 'number' && typeof dataB === 'number') {
    return dataA - dataB;
  }

  return dataA.toString().toLowerCase().localeCompare(dataB.toString().toLowerCase());
};


const CustomDataTable = ({
  id,
  className,
  showColors,

  // config
  size = 'lg',
  radio,
  useStaticWidth,

  // toolbar
  search,
  secondaryButtons,
  primaryButton,
  primaryButtonDisabled,
  getBatchActions,
  batchActionsDisabled,
  hideSelectAll,
  filter,
  columnCustomization,
  refresh,
  exportButton,

  // data
  loading,
  headers,
  rows,

  // pagination
  pagination,

  // empty state
  emptyState,

  // customHandlers
  sortRowHandler = undefined,
  tableHeaderClickHandler = undefined,
  onRowMouseEnter,
  onRowMouseLeave
}) => {
  // Render
  const hasSelectedFilters = !!Object.values((filter?.selectedFilters || {})).flat().length || (filter?.hasDateRange && filter?.startDate && filter?.endDate);

  return (
    <div
      id={id}
      className={`
        custom-data-table
        ${hasSelectedFilters ? 'reveal-filter-summary' : ''}
        ${headers.length && headers[headers.length - 1].key === 'actions' ? 'has-actions-columns' : ''}
        ${className || ''}`
      }
    >
      <DataTable
        size={size}
        headers={headers}
        rows={rows}
        isSortable
        radio={radio}
        useStaticWidth={useStaticWidth}
        sortRow={sortRowHandler ? sortRowHandler : sortRow}
        tableHeaderClickHandler={tableHeaderClickHandler}
        render={({
          rows,
          headers,
          getHeaderProps,
          getSelectionProps,
          getToolbarProps,
          getBatchActionProps,
          getRowProps,
          onInputChange,
          selectedRows,
          sortBy,
          getTableProps,
          getTableContainerProps
        }) => (
          <>
          {
            (!!getBatchActions || !!search || !!filter || !!columnCustomization || !!refresh || !!exportButton || !!secondaryButtons || !!primaryButton) &&
            <TableToolbar {...getToolbarProps()}>
              {!!getBatchActions &&
                <TableBatchActions {...getBatchActionProps()}>
                  {(getBatchActions(selectedRows) || []).map(batchAction => (
                    <TableBatchAction
                      key={batchAction.text}
                      tabIndex={-1}
                      renderIcon={batchAction.icon}
                      iconDescription={batchAction.text}
                      onClick={() => batchAction.onClick(selectedRows)}
                      disabled={batchAction.disabled}
                    >
                      {batchAction.text}
                    </TableBatchAction>
                  ))}
                </TableBatchActions>
              }
              <TableToolbarContent>
                {!!search &&
                  <TableToolbarSearch
                    disabled={loading}
                    tabIndex={getBatchActionProps().shouldShowBatchActions ? -1 : 0}
                    persistent={search.persistent}
                    placeholder={search.placeholder}
                    value={search.searchText}
                    onChange={event => search.onChange(event.target.value)}
                  />
                }
                {!!filter &&
                  <FilterFlyout
                    {...filter}
                    buttonOverrides={{
                      disabled: loading || !filter.filters?.length,
                      ...filter?.buttonOverrides
                    }}
                  />
                }
                {!!columnCustomization &&
                  <ColumnsFlyout
                    {...columnCustomization}
                    buttonOverrides={{
                      disabled: loading,
                      align: 'bottom',
                      ...columnCustomization?.buttonOverrides
                    }}
                  />
                }
                {!!refresh &&
                  <IconButton
                    kind="ghost"
                    size="lg"
                    renderIcon={Renew}
                    iconDescription={refresh.label}
                    label={refresh.label}
                    align={refresh.align || 'bottom'}
                    enterDelayMs={0}
                    leaveDelayMs={0}
                    onClick={refresh.onClick}
                  />
                }
                {!!exportButton && 
                  <IconButton
                    size="lg"
                    kind="ghost"
                    renderIcon={Download}
                    iconDescription={exportButton.label}
                    label={exportButton.label}
                    align={exportButton.align || 'bottom'}
                    enterDelayMs={0}
                    leaveDelayMs={0}
                    onClick={() => exportButton.onClick(exportButton.exportdata)}
                    disabled={exportButton.disabled}
                  />
                }
                {secondaryButtons}
                {!!primaryButton &&
                  <Button
                    disabled={loading || primaryButtonDisabled}
                    tabIndex={getBatchActionProps().shouldShowBatchActions ? -1 : 0}
                    tooltipPosition="top"
                    {...primaryButton}
                  />
                }
              </TableToolbarContent>
            </TableToolbar>
          }
            <div
              className={`
                cdt-filter-summary
                ${!hasSelectedFilters ? 'suppress' : ''}
              `}
            >
              {hasSelectedFilters &&
                <div className="filter-summary-content">
                  <FormLabel>
                    {'Filters:'}
                  </FormLabel>
                  {Object.entries((filter?.selectedFilters || {})).map(([key, values]) =>
                    values.map(value =>
                      <Tag
                        filter
                        type="high-contrast"
                        title={`${key}:${value}`}
                        onClose={() => filter?.setSelectedFilters(prev => ({
                          ...prev,
                          [key]: prev[key]?.filter(f => f !== value)
                        }))}
                      >
                        {key}:{value}
                      </Tag>
                    )
                  )}
                  {filter?.hasDateRange && filter?.startDate && filter?.endDate && (
                    <Tag
                      filter
                      type="high-contrast"
                      title={`${filter?.dateLabel}:${filter?.startDate}-${filter?.endDate}`}
                      onClose={() => {
                        filter?.setStartDate(undefined);
                        filter?.setEndDate(undefined);
                      }}
                    >
                      {`${filter?.dateLabel}:${filter?.startDate}-${filter?.endDate}`}
                    </Tag>
                  )}
                  <Button
                    tabIndex={Object.values(filter.selectedFilters).flat().length ? 0 : -1}
                    kind="ghost"
                    size="sm"
                    onClick={() => {
                      filter.setSelectedFilters({});
                      if (filter?.hasDateRange) {
                        filter?.setStartDate(undefined);
                        filter?.setEndDate(undefined);
                      }
                    }}
                  >
                    {'Clear filters'}
                  </Button>
                </div>
              }
            </div>
            {loading &&
              <div className="custom-data-table-skeleton">
                <DataTableSkeleton rowCount={3} />
              </div>
            }
            {!loading &&
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {!hideSelectAll && !!getBatchActions &&
                      <TableSelectAll
                        {...getSelectionProps()}
                        id={`${id}-select-all`}
                      />
                    }
                    {hideSelectAll && !!getBatchActions &&
                      <TableHeader className="cds--table-column-checkbox" />
                    }
                    {headers.map((header, i) => (
                      <TableHeader
                        {...getHeaderProps({ header })}
                        id={`${id}-${header.key}-header`}
                        key={i}
                        title={header.header}
                        className={header.key}
                        onClickCapture={tableHeaderClickHandler}
                      >
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow
                      key={row.id} {...getRowProps({ row })}
                      className={ showColors ? i === 0 ? 'row-red' : i === 1 ? 'row-yellow' : '' : ''}
                      onMouseEnter={() => onRowMouseEnter ? onRowMouseEnter(row) : null}
                      onMouseLeave={() => onRowMouseLeave ? onRowMouseLeave(row) : null}
                    >
                      {!!getBatchActions &&
                        <TableSelectRow
                          {...getSelectionProps({ row })}
                          id={`${row.id}-select`}
                          disabled={batchActionsDisabled}
                        />
                      }
                      {row.cells.map(({ id, value, info : {header} }) => {
                        let formattedCell = value;

                        switch (value?.displayType) {
                          case 'actions': {
                            if (!value?.items?.length || !value?.items?.some(i =>
                              !i.disabled
                            )) {
                              formattedCell = (
                                <IconButton
                                  disabled
                                  kind="ghost"
                                  className="disabled-overflow-menu"
                                  renderIcon={OverflowMenuVertical}
                                  iconDescription={'Actions'}
                                  label={'Actions'}
                                  aria-label={'Actions'}
                                />
                              );
                            } else {
                              formattedCell = (
                                <OverflowMenu
                                  id={`${id}-overflow-menu`}
                                  className="actions-column"
                                  light={false}
                                  flipped
                                  aria-label={'Actions'}
                                  onOpen={() => window.scrollTo(0, document.body.scrollHeight)}
                                >
                                  {value.items.map(item => (
                                    <OverflowMenuItem
                                      key={`overflow-menu-${item.itemText}`}
                                      ariaLabel={item.itemText}
                                      itemText={item.itemText}
                                      isDelete={item.isDelete}
                                      disabled={item.disabled}
                                      onClick={() => item.onClick()}
                                      requireTitle
                                    />
                                  ))}
                                </OverflowMenu>
                              );
                            }
                            break;
                          }
                          case 'button-link':
                            formattedCell = (
                              <button
                                className="button-link cds--link truncate"
                                onClick={value.onClick}
                              >
                                {value.data}
                              </button>
                            );
                            break;
                          case 'user-profile':
                            formattedCell = (
                              <div className="user-profile-column">
                                <div className="photo">
                                  {value.data ? value.data?.slice(0, 1).toUpperCase() : '?'}
                                </div>
                                <div className="truncate">
                                  {value.data}
                                </div>
                              </div>
                            );
                            break;
                          case 'code':
                            formattedCell = (
                              <div
                                className="code truncate"
                                style={{ fontWeight: value.bold ? 600 : 400 }}
                                title={value.data}
                              >
                                {value.data}
                              </div>
                            );
                            break;
                          case 'link':
                            formattedCell = (
                              <Link
                                href={value.href || null}
                                onClick={() => !value.href && value.onClick ? value.onClick() : null}
                                renderIcon={value.renderIcon}
                              >
                                {value.data}
                              </Link>
                            );
                            break;
                          case 'number': {
                            let unit;
                            if (value.unit) {
                              unit = ` ${value.unit}`;

                              if (value.plural && value.data !== 1) {
                                unit += 's';
                              }
                            }

                            formattedCell = (
                              <div className="number">
                                <span>
                                  {value.data.toLocaleString()}
                                  {unit}
                                </span>
                              </div>
                            );
                            break;
                          }
                          case 'status': {
                            formattedCell = (
                              <StatusIndicator
                                type={value?.type}
                                subType={value?.subType}
                                status={value.data}
                              />
                            );
                            break;
                          }
                          case 'timestamp':
                            if (!!value.data && Moment(new Date(value.data)) !== 'Invalid date') {
                              let converted = value.data * 1000; // assume epoch time by default
                              if (typeof value.data !== 'number') {
                                converted = value.data;
                              }

                              formattedCell = Moment(new Date(converted)).format('MMM D, YYYY h:mm:ss A');
                            } else {
                              formattedCell = '';
                            }
                            break;
                          case 'timestamp-with-nano-secs':
                            if (!!value.data) {
                              try {
                                const milliseconds = Math.floor(value.data / 1e6);
                                const date = new Date(milliseconds);
                                // const nanoseconds = (value.data % 1e6) * 1e3; //Nanoseconds in case needed in the future
                                const formattedDateTime = `${Moment(new Date(date)).format('MMM D, YYYY h:mm:ss A')}`;
                                formattedCell = formattedDateTime;
                              } catch (error) {
                                formattedCell = '';
                              }
                            } else {
                              formattedCell = '';
                            }
                            break;
                          case 'toggletip':
                            if (value?.content) {
                              formattedCell = (
                                <Toggletip
                                  align="top"
                                  enterDelayMs={0}
                                  leaveDelayMs={0}
                                >
                                  <ToggletipButton className="button-link cds--link">
                                    {value?.data}
                                  </ToggletipButton>
                                  <ToggletipContent>
                                    {value?.content}
                                  </ToggletipContent>
                                </Toggletip>
                              );
                            } else {
                              formattedCell = value?.data;
                            }
                            break;
                          case 'watsonx':
                            formattedCell = (
                              <div className="watsonx-column">
                                <div 
                                  className="truncate"
                                  // style={{ fontWeight: value?.description ? 600 : 400 }}
                                >
                                  {value?.data}
                                </div>
                                {value?.description && 
                                  <div className="concept-description">
                                    {value?.concept && 
                                      <>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <mask id="path-1-inside-1_159_168526" fill="white">
                                            <path d="M2.23234 8.12801C1.92255 8.27925 1.92255 8.72075 2.23234 8.87199C2.56164 9.03054 2.99583 9.22568 3.51051 9.42082C5.38873 10.1306 6.86936 11.6137 7.57918 13.4895C7.77432 14.0066 7.96946 14.4408 8.12801 14.7677C8.27925 15.0774 8.72075 15.0774 8.87199 14.7677C9.03054 14.4384 9.22568 14.0042 9.42082 13.4895C10.1306 11.6113 11.6137 10.1306 13.4895 9.42082C14.0066 9.22568 14.4408 9.03054 14.7677 8.87199C15.0774 8.72075 15.0774 8.27925 14.7677 8.12801C14.4384 7.96946 14.0042 7.77432 13.4895 7.57918C11.6113 6.86936 10.1306 5.38629 9.42082 3.51051C9.22568 2.99339 9.03054 2.5592 8.87199 2.23234C8.72075 1.92255 8.27925 1.92255 8.12801 2.23234C7.96946 2.56164 7.77432 2.99582 7.57918 3.51051C6.86936 5.38873 5.38629 6.86936 3.51051 7.57918C2.99339 7.77676 2.56164 7.96946 2.23234 8.12801Z"/>
                                          </mask>
                                          <path d="M2.23234 8.12801L1.36469 6.32598L1.35493 6.33075L2.23234 8.12801ZM2.23234 8.87199L1.35492 10.6693L1.36471 10.674L2.23234 8.87199ZM3.51051 9.42082L2.80147 11.2909L2.80347 11.2917L3.51051 9.42082ZM7.57918 13.4895L9.45039 12.7834L9.44973 12.7817L7.57918 13.4895ZM8.12801 14.7677L6.32854 15.6405L6.33075 15.6451L8.12801 14.7677ZM8.87199 14.7677L10.6693 15.6451L10.674 15.6353L8.87199 14.7677ZM9.42082 13.4895L11.2909 14.1985L11.2917 14.1965L9.42082 13.4895ZM13.4895 9.42082L12.7834 7.54961L12.7816 7.55027L13.4895 9.42082ZM14.7677 8.87199L15.6405 10.6715L15.6451 10.6693L14.7677 8.87199ZM14.7677 8.12801L15.6451 6.33072L15.6353 6.32601L14.7677 8.12801ZM13.4895 7.57918L14.1985 5.70908L14.1965 5.70833L13.4895 7.57918ZM9.42082 3.51051L7.54961 4.21662L7.55027 4.21835L9.42082 3.51051ZM8.87199 2.23234L10.6715 1.35946L10.6693 1.35493L8.87199 2.23234ZM8.12801 2.23234L6.33072 1.35492L6.32601 1.36471L8.12801 2.23234ZM7.57918 3.51051L5.70908 2.80147L5.70833 2.80347L7.57918 3.51051ZM3.51051 7.57918L2.80266 5.70862L2.79668 5.71091L3.51051 7.57918ZM1.35493 6.33075C-0.451645 7.2127 -0.451645 9.7873 1.35493 10.6693L3.10974 7.07472C4.29675 7.65421 4.29675 9.34579 3.10974 9.92528L1.35493 6.33075ZM1.36471 10.674C1.735 10.8523 2.22276 11.0715 2.80147 11.2909L4.21955 7.55072C3.76889 7.37986 3.38828 7.2088 3.09997 7.06998L1.36471 10.674ZM2.80347 11.2917C4.1438 11.7982 5.20142 12.857 5.70863 14.1973L9.44973 12.7817C8.5373 10.3704 6.63366 8.46307 4.21755 7.54996L2.80347 11.2917ZM5.70798 14.1956C5.92778 14.7781 6.14797 15.2683 6.32854 15.6405L9.92748 13.8948C9.79096 13.6133 9.62086 13.2352 9.45038 12.7834L5.70798 14.1956ZM6.33075 15.6451C7.2127 17.4516 9.7873 17.4516 10.6693 15.6451L7.07472 13.8903C7.65421 12.7032 9.34579 12.7032 9.92528 13.8903L6.33075 15.6451ZM10.674 15.6353C10.8523 15.265 11.0715 14.7772 11.2909 14.1985L7.55072 12.7805C7.37986 13.2311 7.2088 13.6117 7.06998 13.9L10.674 15.6353ZM11.2917 14.1965C11.7982 12.8562 12.857 11.7986 14.1973 11.2914L12.7816 7.55027C10.3704 8.4627 8.46307 10.3663 7.54996 12.7825L11.2917 14.1965ZM14.1956 11.292C14.7781 11.0722 15.2683 10.852 15.6405 10.6715L13.8948 7.07252C13.6133 7.20904 13.2352 7.37913 12.7834 7.54961L14.1956 11.292ZM15.6451 10.6693C17.4516 9.7873 17.4516 7.2127 15.6451 6.33075L13.8903 9.92528C12.7032 9.34579 12.7032 7.65421 13.8903 7.07472L15.6451 10.6693ZM15.6353 6.32601C15.265 6.14772 14.7772 5.9285 14.1985 5.70909L12.7804 9.44928C13.2311 9.62014 13.6117 9.7912 13.9 9.93002L15.6353 6.32601ZM14.1965 5.70833C12.8562 5.20179 11.7986 4.14302 11.2914 2.80267L7.55027 4.21835C8.4627 6.62956 10.3663 8.53693 12.7825 9.45004L14.1965 5.70833ZM11.292 2.80439C11.0722 2.22192 10.852 1.73173 10.6715 1.35946L7.07252 3.10522C7.20904 3.38667 7.37913 3.76485 7.54961 4.21662L11.292 2.80439ZM10.6693 1.35493C9.7873 -0.451645 7.2127 -0.451645 6.33075 1.35493L9.92528 3.10974C9.34579 4.29675 7.65421 4.29675 7.07472 3.10974L10.6693 1.35493ZM6.32601 1.36471C6.14772 1.735 5.9285 2.22276 5.70908 2.80147L9.44928 4.21955C9.62014 3.76889 9.7912 3.38828 9.93002 3.09997L6.32601 1.36471ZM5.70833 2.80347C5.20179 4.1438 4.14302 5.20142 2.80267 5.70863L4.21835 9.44973C6.62956 8.5373 8.53693 6.63366 9.45004 4.21754L5.70833 2.80347ZM2.79668 5.71091C2.2217 5.93059 1.73853 6.14602 1.36471 6.32601L3.09997 9.93002C3.38475 9.7929 3.76507 9.62293 4.22433 9.44746L2.79668 5.71091Z" mask="url(#path-1-inside-1_159_168526)"/>
                                          <line x1="2.5" y1="1" x2="2.5" y2="6" />
                                          <line x1="5" y1="3.5" y2="3.5" />
                                        </svg>
                                        <strong>
                                          {value?.concept}
                                        </strong>
                                        &nbsp;&mdash;&nbsp;
                                      </>
                                    }
                                    {value?.description}
                                  </div>
                                }
                              </div>
                            );
                            break;
                          case 'operation':
                            formattedCell = (
                              <Link
                                style={{ marginLeft:`${ value?.level * 1}rem` }}
                                href={value.href || null}
                                onClick={() => !value.href && value.onClick ? value.onClick() : null}
                                className="truncate"
                              >
                                <Movement></Movement>&nbsp;&nbsp;
                                {value?.operation}
                              </Link>
                            );
                            break;
                          case 'latency':
                            formattedCell = (
                              <div className="latency-column">
                                <div 
                                  className="truncate"
                                >
                                  {value?.latency}s
                                </div>
                              </div>
                            );
                            break;
                          case 'timeline':
                            formattedCell = (
                              <div className="timeline-column">
                               <Slider
                                  labelText=""
                                  value={value?.start}
                                  unstable_valueUpper={value?.end}
                                  min={0}
                                  max={1}
                                  hideTextInput
                                  readOnly
                                />
                              </div>
                            );
                            break;
                          case 'parameters':
                            formattedCell = (
                              <div className="parameters-column">
                                {/* {
                                  value.parameters.map((param, i) => <span key={i} className="parameter">
                                    {param}
                                  </span>)
                                } */}
                                <span className="parameter">
                                  {value.parameters[0]}
                                </span>
                              </div>
                            );
                            break;
                          case 'data':
                            formattedCell = (
                              <div className="data-column">
                                {
                                  value.items.map((d, i) => 
                                    <Tag key={i} className="data remove-outline" type="outline" renderIcon={Document} size="sm" onClick={d.onClick}>
                                      {d.name}
                                    </Tag>
                                  )
                                }
                              </div>
                            );
                            break;
                          default:
                            formattedCell = (
                              React.isValidElement(value) ? value:
                              <div
                                className="truncate"
                                title={typeof value === 'object' ? JSON.stringify(value) : value}
                              >
                                {typeof value === 'object' ? JSON.stringify(value) : value}
                              </div>
                            );
                            break;
                        }

                        return (
                          <TableCell key={id} className={header}>
                            {formattedCell}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            }
          </>
        )}
      />
      {!loading && !rows.length && !!emptyState &&
        <div className="empty-state">
          {emptyState?.type === 'NoData' &&
            <NoDataEmptyState
              size="lg"
              illustrationTheme={"dark"}
              title={emptyState?.title}
              subtitle={emptyState?.noDataSubtitle}
            />
          }
          {emptyState?.type === 'NotFound' &&
            <NotFoundEmptyState
              size="lg"
              illustrationTheme={"dark"}
              title={'No matches found.'}
              subtitle={'Try adjusting your search term or filters.'}
            />
          }
        </div>
      }
      {!!pagination && !!rows.length &&
        <Pagination
          size={size}
          totalItems={pagination?.totalItems}
          page={(pagination?.offset / pagination?.first) + 1}
          pageSize={pagination?.first}
          pageSizes={[10, 25, 50, 100]}
          onChange={({ page, pageSize }) => pagination?.setPagination({
            offset: (page - 1) * pageSize,
            first: pageSize
          })}
          backwardText={'Previous page'}
          forwardText={'Next page'}
          itemRangeText={(min, max, total) => `${min}-${max} of ${total} items`}
          pageRangeText={(_current, total) => `of ${total} pages(s)`}
          itemsPerPageText={'Items per page:'}
        />
      }
    </div>
  );
};

export default CustomDataTable;
