import { useState } from "react"
import { CalendarIcon, ChevronDown } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { ClarificationField, ClarificationFieldValue, ClarificationFormData } from "./conversation-data"

type OptionField = Extract<ClarificationField, { type: "single-select" | "multi-select" }>
type DateRangeValue = Extract<ClarificationFieldValue, { start: string; end: string }>

function isDateRange(value: ClarificationFieldValue | undefined): value is DateRangeValue {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && "start" in value && "end" in value)
}

function isFieldComplete(field: ClarificationField, value: ClarificationFieldValue | undefined) {
  if (!field.required) return true
  if (field.type === "date-range") return isDateRange(value) && Boolean(value.start && value.end)
  if (Array.isArray(value)) return value.length > 0
  return typeof value === "string" && Boolean(value.trim())
}

function getOptionLabels(field: OptionField, value: ClarificationFieldValue | undefined) {
  if (!value) return "未填写"
  const values = Array.isArray(value) ? value : [value]
  return field.options.filter((option) => values.includes(option.value)).map((option) => option.label).join("、") || "未填写"
}

function formatDate(date: string) {
  const [year, month, day] = date.split("-")
  return year && month && day ? `${year}年${Number(month)}月${Number(day)}日` : date
}

function getDateRangeLabel(value: ClarificationFieldValue | undefined) {
  if (!isDateRange(value) || !value.start || !value.end) return "未填写"
  return `${formatDate(value.start)} 至 ${formatDate(value.end)}`
}

function parseDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return undefined

  const date = new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function formatDateInput(value: Date) {
  return format(value, "yyyy-MM-dd")
}

function toCalendarRange(value: ClarificationFieldValue | undefined): DateRange | undefined {
  if (!isDateRange(value)) return undefined

  const from = parseDateInput(value.start)
  const to = parseDateInput(value.end)
  return from || to ? { from, to } : undefined
}

type ClarificationFormCardProps = {
  form: ClarificationFormData
  onSubmit?: (formId: string) => void
  submitted?: boolean
}

export function ClarificationFormCard({ form, onSubmit, submitted = false }: ClarificationFormCardProps) {
  const [open, setOpen] = useState(form.defaultOpen ?? true)
  const [locallySubmitted, setLocallySubmitted] = useState(false)
  const [values, setValues] = useState<Record<string, ClarificationFieldValue>>(form.initialValues ?? {})
  const isSubmitted = submitted || locallySubmitted
  const canSubmit = form.fields.every((field) => isFieldComplete(field, values[field.id]))

  const setValue = (id: string, value: ClarificationFieldValue) => setValues((current) => ({ ...current, [id]: value }))
  const toggleMultiSelect = (fieldId: string, option: string) => {
    const current = values[fieldId]
    const selected = Array.isArray(current) ? current : []
    setValue(fieldId, selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option])
  }

  return (
    <section className="max-w-[600px] overflow-hidden rounded-xl border bg-card shadow-xs">
      <button
        type="button"
        aria-expanded={open}
        aria-label={`${open ? "收起" : "展开"}${form.title}`}
        className="flex w-full items-center justify-between gap-3 p-3 text-left transition-colors hover:bg-muted/50"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="text-base font-medium leading-6 text-foreground">{form.title}</span>
        <span className="flex shrink-0 items-center gap-2 text-sm leading-5 text-muted-foreground">
          {isSubmitted && "已提交"}
          <ChevronDown className={cn("size-4 transition-transform motion-reduce:transition-none", open && "rotate-180")} />
        </span>
      </button>

      <div
        aria-hidden={!open}
        inert={!open || undefined}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <form
            className="space-y-4 p-4"
            onSubmit={(event) => {
              event.preventDefault()
              if (!canSubmit || isSubmitted) return
              setLocallySubmitted(true)
              onSubmit?.(form.id)
            }}
          >
            {form.description && <p className="text-sm leading-5 text-muted-foreground">{form.description}</p>}
            {form.fields.map((field, index) => (
              <FormField
                key={field.id}
                field={field}
                index={index}
                submitted={isSubmitted}
                value={values[field.id]}
                onChange={(value) => setValue(field.id, value)}
                onToggleOption={(option) => toggleMultiSelect(field.id, option)}
              />
            ))}
            {!isSubmitted && <div className="flex items-center gap-2 pt-1"><Button type="submit" className="h-9 min-w-18" disabled={!canSubmit}>{form.submitLabel ?? "提交"}</Button></div>}
          </form>
        </div>
      </div>
    </section>
  )
}

function FormField({
  field,
  index,
  onChange,
  onToggleOption,
  submitted,
  value,
}: {
  field: ClarificationField
  index: number
  onChange: (value: ClarificationFieldValue) => void
  onToggleOption: (option: string) => void
  submitted: boolean
  value: ClarificationFieldValue | undefined
}) {
  const label = `${index + 1}. ${field.label}`
  const textValue = typeof value === "string" ? value : ""

  if (submitted) {
    const displayValue = field.type === "single-select" || field.type === "multi-select"
      ? getOptionLabels(field, value)
      : field.type === "date-range"
        ? getDateRangeLabel(value)
        : textValue || "未填写"
    return <div className="space-y-1.5"><p className="text-sm font-medium leading-5 text-foreground">{label}</p><p className="text-sm leading-5 text-foreground">{displayValue}</p></div>
  }

  return (
    <FieldSet className="gap-2">
      <FieldLegend variant="label" className="mb-0 text-sm leading-5 text-foreground">
        {label}{field.required && <span className="ml-1 text-destructive">*</span>}
      </FieldLegend>
      {field.type === "text" && (
        <Field>
          <Input value={textValue} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} />
        </Field>
      )}
      {field.type === "textarea" && (
        <Field>
          <Textarea value={textValue} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} />
        </Field>
      )}
      {field.type === "date-range" && (
        <DateRangePicker value={value} onChange={onChange} />
      )}
      {field.type === "single-select" && (
        <RadioGroup value={textValue} onValueChange={onChange} className="flex flex-wrap gap-x-3 gap-y-2 py-1">
          {field.options.map((option) => (
            <Field key={option.value} orientation="horizontal" className="w-auto gap-2">
              <RadioGroupItem id={`${field.id}-${option.value}`} value={option.value} />
              <FieldLabel htmlFor={`${field.id}-${option.value}`} className="text-sm font-normal text-foreground">{option.label}</FieldLabel>
            </Field>
          ))}
        </RadioGroup>
      )}
      {field.type === "multi-select" && (
        <div className="flex flex-wrap gap-x-3 gap-y-2 py-1" data-slot="checkbox-group">
          {field.options.map((option) => {
            const checked = Array.isArray(value) && value.includes(option.value)
            return (
              <Field key={option.value} orientation="horizontal" className="w-auto gap-2">
                <Checkbox id={`${field.id}-${option.value}`} checked={checked} onCheckedChange={() => onToggleOption(option.value)} />
                <FieldLabel htmlFor={`${field.id}-${option.value}`} className="text-sm font-normal text-foreground">{option.label}</FieldLabel>
              </Field>
            )
          })}
        </div>
      )}
    </FieldSet>
  )
}

function DateRangePicker({
  value,
  onChange,
}: {
  value: ClarificationFieldValue | undefined
  onChange: (value: DateRangeValue) => void
}) {
  const range = toCalendarRange(value)
  const rangeLabel = range?.from
    ? range.to
      ? `${format(range.from, "PPP", { locale: zhCN })} 至 ${format(range.to, "PPP", { locale: zhCN })}`
      : format(range.from, "PPP", { locale: zhCN })
    : "选择出发与返程日期"

  return (
    <Field>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              aria-label="选择出发与返程日期"
              data-empty={!range?.from}
              className="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
            >
              <CalendarIcon />
              {rangeLabel}
            </Button>
          }
        />
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="range"
            defaultMonth={range?.from}
            selected={range}
            onSelect={(nextRange) => {
              onChange({
                start: nextRange?.from ? formatDateInput(nextRange.from) : "",
                end: nextRange?.to ? formatDateInput(nextRange.to) : "",
              })
            }}
            locale={zhCN}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}
