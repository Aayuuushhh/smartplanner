import { Fragment, useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import DateTimePicker from './DateTimePicker2';
import { Event, RecurrenceData } from '../app/types/types';
import Description from './Description';

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: Partial<Event>;
  setEvent: (event: Partial<Event> | ((prevEvent: Partial<Event>) => Partial<Event>)) => void;
  onSave: () => void;
  onDelete: () => void;
  handleDelete : () => void ; 
  showDeleteOptions: boolean; // Add this prop
  setShowDeleteOptions: (value: boolean) => void;
}

const getOrdinal = (date: Date) => {
  const day = date.getDate();
  const week = Math.floor((day - 1) / 7) + 1;
  switch (week) {
    case 1:
      return 'first';
    case 2:
      return 'second';
    case 3:
      return 'third';
    case 4:
      return 'fourth';
    default:
      return 'fifth';
  }
};

const daysOfWeek = [
  { label: 'Sun', symbol: 'S' },
  { label: 'Mon', symbol: 'M' },
  { label: 'Tue', symbol: 'T' },
  { label: 'Wed', symbol: 'W' },
  { label: 'Thu', symbol: 'T' },
  { label: 'Fri', symbol: 'F' },
  { label: 'Sat', symbol: 'S' }
];

export default function EventDialog({
  isOpen,
  onClose,
  event,
  setEvent,
  onSave,
  onDelete,
  handleDelete,
  showDeleteOptions,
  setShowDeleteOptions,
}: EventDialogProps) {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
 

  const handleRecurrenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const freq = e.target.value;
    const startDate = new Date(event.date || new Date().toISOString());
    const endDate = new Date(startDate);
    let recurrenceData: RecurrenceData = {
      type: 'default',
      custom: null,
      freq: freq === 'Custom' ? 'custom' : freq,
      start_date: new Date(startDate.getTime()).toISOString(),
      end_date: ''
    };

    if (freq === 'custom') {
      recurrenceData = {
        ...recurrenceData,
        type: 'custom',
        custom: {
          interval: '1',
          type: 'Week',
          end_type: 'ondate',
          end_count: '',
          by_day: [],
          by_month: '',
        },
        start_date: new Date(startDate.getTime()).toISOString(),
        end_date: endDate.toISOString(),
      };
      setIsCustomOpen(true);
    } else {
      recurrenceData = {
        ...recurrenceData,
        custom: null,
        start_date: '',
        end_date: '',
      };
    }

    setEvent({
      ...event,
      isrecurrence: freq === 'Do not Repeat' ? 0 : 1,
      recurrencedata: recurrenceData,
    });
  };

  const handleCustomDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleCustomRecurrenceChange = (updatedData: Partial<RecurrenceData['custom']>) => {
    setEvent((prevEvent: Partial<Event>) => {
      const end_date = prevEvent.recurrencedata?.end_date!;
      const updatedRecurrenceData: RecurrenceData = {
        ...prevEvent.recurrencedata!,
        custom: {
          ...prevEvent.recurrencedata?.custom!,
          ...updatedData,
        },
        end_date,
      };

      return {
        ...prevEvent,
        recurrencedata: updatedRecurrenceData,
      };
    });
  };


  const renderCustomRecurrenceSummary = () => {
    if (event.recurrencedata?.freq !== 'custom' || !event.recurrencedata.custom) return null;

    const { interval, type, end_type, end_count, by_day, by_month } = event.recurrencedata.custom;

    const repeatText = `Repeats every ${interval} ${type}(s)`;
    let endText = '';
    if (end_type === 'after6') {
      const startDate = new Date(event.recurrencedata.start_date as string);
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + 6);
      endText = `Ends after 6 months (${endDate.toLocaleDateString()})`;
    } else if (end_type === 'ondate') {
      endText = `Ends on ${new Date(event.recurrencedata.end_date as string).toLocaleDateString()}`;
    } else if (end_type === 'after') {
      endText = `Ends after ${end_count} occurrences`;
    }

    const byDayText = type === 'Week' && Array.isArray(by_day) && by_day.length > 0 ? `on ${by_day.join(', ')}` : '';
    const byMonthText = type === 'Month' && by_month ? `by ${by_month}` : '';

    return (
      <div className="mb-1 p-1 border border-gray-300 rounded mt-2">
        <div className="flex justify-between items-center">
          <div>
            <p>{repeatText} {endText} {byDayText}</p>
            <p>{byMonthText}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsCustomOpen(true)}
            className="text-blue-500 hover:text-blue-700"
          >
            <FaEdit />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4 text-center">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black opacity-50"></div>
            </div>
            <div className="inline-block overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl" style={{ width: '100%', maxWidth: '600px' }}>
              <div className="p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {event.id ? 'Edit Event' : 'Add Event'}
                </h3>
                <div className="mt-1">
                  <form>
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-black">
                        Event Title
                      </label>
                      <input
                        type="text"
                        placeholder="Event Title"
                        value={event.title || ''}
                        onChange={(e) => setEvent({ ...event, title: e.target.value })}
                        className="w-full border border-gray-300 rounded p-2"
                      />
                    </div>
                    <div className="flex flex-row gap-5">
                      <div className="w-1/3">
                        <DateTimePicker
                          label="Start Date and Time"
                          popperPlacement="right-end"
                          selectedDate={event.date ? new Date(event.date) : null}
                          onChange={(date) =>{
                            if(date){
                            const endDate = new Date(date.getTime() + 30 * 60 * 1000); // Add 30 minutes
                            setEvent({ ...event, date: date?.toISOString(), endDate: endDate.toISOString()  })  ;
                            } 
                            }
                          }
                          popperClassName="z-50"
                        />
                      </div>
                      <div className="w-1/3">
                          
                        <DateTimePicker
                          label="End Date and Time"
                          popperPlacement="bottom"
                          selectedDate={event.endDate ? new Date(event.endDate) : null}
                          onChange={(date) =>
                            setEvent({ ...event, endDate: date?.toISOString() })
                          }
                          popperClassName="z-50"
                        />
                      </div>
                      <div className='w-1/3'>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequency
                        </label>
                        <select
                          value={event.recurrencedata?.freq || 'Do not Repeat'}
                          onChange={handleRecurrenceChange}
                          className="w-full border border-gray-300 rounded p-2"
                        >
                          <option value="Do not Repeat">Do Not Repeat</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                    </div>
                    {renderCustomRecurrenceSummary()}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 ">
                        Description
                      </label>

                      <Description event={event} setEvent={setEvent}  ></Description>
                    </div>
                  </form>
                </div>
                <div className="mt-4 flex justify-end">
                  {event.id && (
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 mr-2"
                      onClick={() => {
                        console.log(typeof setShowDeleteOptions); // Should log 'function'
                        setShowDeleteOptions(true);
                      }}
                    >
                      Delete
                    </button>
                  )}
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onSave}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 ml-2"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCustomOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-20"
          onClick={(e) => {
            setIsCustomOpen(false);
          }}
        >
          <div
            className="bg-white rounded-lg p-6 shadow-lg"
            onClick={handleCustomDialogClick}
          >
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Custom Recurrence
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Define your custom recurrence pattern.
              </p>
              <form>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Repeat Every</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={event.recurrencedata?.custom?.interval || '1'}
                      onChange={(e) =>
                        handleCustomRecurrenceChange({
                          interval: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded p-2"
                      min={1}
                    />
                    <select
                      value={event.recurrencedata?.custom?.type || 'Day'}
                      onChange={(e) =>
                        handleCustomRecurrenceChange({
                          type: e.target.value,
                        })
                      }
                      className="border border-gray-300 rounded p-2"
                    >
                      <option value="Day">Day(s)</option>
                      <option value="Week">Week(s)</option>
                      <option value="Month">Month(s)</option>
                      <option value="Year">Year(s)</option>
                    </select>
                  </div>
                </div>
                {event.recurrencedata?.custom?.type === 'Week' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Days of the Week</label>
                    <div className="flex flex-wrap">
                      {daysOfWeek.map((day) => (
                        <label key={day.label} className="mr-4">
                          <input
                            type="checkbox"
                            checked={event.recurrencedata?.custom?.by_day.includes(day.label)}
                            onChange={(e) => {
                              const by_day = event.recurrencedata?.custom?.by_day || [];
                              if (e.target.checked) {
                                handleCustomRecurrenceChange({
                                  by_day: [...by_day, day.label],
                                });
                              } else {
                                handleCustomRecurrenceChange({
                                  by_day: by_day.filter((d) => d !== day.label),
                                });
                              }
                            }}
                          />
                          {day.symbol}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {event.recurrencedata?.custom?.type === 'Month' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Repeat by
                      </label>
                      <select
                        value={event.recurrencedata?.custom?.by_month || 'day'}
                        onChange={(e) =>{
                          console.log(e.target.value)
                          handleCustomRecurrenceChange({ by_month: e.target.value })
                        }
                        }
                        className="w-full border border-gray-300 rounded p-2"
                      >
                        <option value={`Monthly on day ${new Date(event.date || new Date()).getDate()}`}>
                          Monthly on day {new Date(event.date || new Date()).getDate()}
                        </option>
                        <option value={`Monthly on day ${getOrdinal(new Date(event.date || new Date()))} ${new Date(event.date || new Date()).toLocaleString('default', { weekday: 'long' })}`}>
                          Monthly on {getOrdinal(new Date(event.date || new Date()))} {new Date(event.date || new Date()).toLocaleString('default', { weekday: 'long' })}
                      </option>
                    </select>
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Schedule End</label>
                  <div className="flex flex-col space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="end_option"
                        value="after6"
                        checked={event.recurrencedata?.custom?.end_type === 'after6'}
                        onChange={(e) => {
                          const startDate = new Date(event.recurrencedata!.start_date as string);
                          const endDate = new Date(startDate);
                          endDate.setMonth(startDate.getMonth() + 6);
                          handleCustomRecurrenceChange({
                            end_type: e.target.value,
                          });
                          setEvent(prevEvent => ({
                            ...prevEvent,
                            recurrencedata: {
                              ...prevEvent.recurrencedata!,
                              end_date: endDate.toISOString().replace('T', ' '),
                            }
                          }));
                        }}
                      />
                      <span>After 6 months</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="end_option"
                        value="ondate"
                        checked={event.recurrencedata?.custom?.end_type === 'ondate'}
                        onChange={(e) =>
                          handleCustomRecurrenceChange({
                            end_type: e.target.value,
                          })
                        }
                      />
                      <span>On Date</span>
                      {event.recurrencedata?.custom?.end_type === 'ondate' && (
                        <DateTimePicker
                          label=""
                          popperPlacement="right-end"
                          selectedDate={
                            event.recurrencedata?.end_date && typeof event.recurrencedata.end_date === 'string'
                              ? new Date(event.recurrencedata.end_date)
                              : null
                          }
                          onChange={(date) =>
                            setEvent((prevEvent) => ({
                              ...prevEvent,
                              recurrencedata: {
                                ...prevEvent.recurrencedata!,
                                end_date: date?.toISOString().replace('T', ' ') || "",
                              }
                            }))
                          }
                        />
                      )}
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="end_option"
                        value="after"
                        checked={event.recurrencedata?.custom?.end_type === 'after'}
                        onChange={(e) =>
                          handleCustomRecurrenceChange({
                            end_type: e.target.value,
                          })
                        }
                      />
                      <span>After</span>
                      {event.recurrencedata?.custom?.end_type === 'after' && (
                        <>
                          <input
                            type="number"
                            value={event.recurrencedata?.custom?.end_count || '1'}
                            onChange={(e) =>
                              handleCustomRecurrenceChange({
                                end_count: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded p-2"
                            min={1}
                          />
                          <span>Occurrences</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </form>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                onClick={() => {
                  setIsCustomOpen(false);
                }}
              >
                Save
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 ml-2"
                onClick={() => {
                  setIsCustomOpen(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteOptions && (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Event</h3>
        <p className="text-sm text-gray-600 mb-6">
          Do you want to delete only this event or all recurring events?
        </p>
        <div className="flex justify-end">
          <button
            className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-400 mr-2"
            onClick={() => setShowDeleteOptions(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm text-red-700 bg-red-200 rounded hover:bg-red-300 focus:outline-none focus:ring focus:ring-red-400 mr-2"
            onClick={handleDelete}
          >
            Delete This Event
          </button>
          <button
            className="px-4 py-2 text-sm text-red-700 bg-red-200 rounded hover:bg-red-300 focus:outline-none focus:ring focus:ring-red-400"
            onClick={onDelete}
          >
            Delete All Events
          </button>
        </div>
      </div>
    </div>
  )}
    </>
  );
  
}

