import clsx, { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

const dateFormater = new Intl.DateTimeFormat(window.context.locale, {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'UTC'
})
export const formatDateFromMs = (ms: number) => dateFormater.format(ms)
export const cn = (...args: ClassValue[]) => {
  return twMerge(clsx(...args))
}
