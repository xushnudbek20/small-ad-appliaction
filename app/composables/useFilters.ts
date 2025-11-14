export const useFilters = () => {
  const isAuth = computed(() => {
    return Boolean(useCookie('accessToken').value)
  })
  function formatDateYmd(val, format = 'DD.MM.YYYY HH:mm:ss') {
    if (val) {
      let value = val
      if (val.search('T') > 0) {
        value = val.replace('T', ' ').slice(0, 19)
      } else if (val.search('-')) {
        value = val.replace(/-/g, '/')
      }

      const dateClass = value != '' ? new Date(value) : new Date()
      if (format.search('YYYY') >= 0) {
        format = format.replace('YYYY', String(dateClass.getFullYear()))
      }
      if (format.search('MM') >= 0) {
        const monthInt = dateClass.getMonth() + 1
        const month = monthInt > 9 ? monthInt : (`0${monthInt}`)
        format = format.replace('MM', String(month))
      }
      if (format.search('DD') >= 0) {
        const day = dateClass.getDate() > 9 ? dateClass.getDate() : (`0${dateClass.getDate()}`)
        format = format.replace('DD', String(day))
      }
      if (format.search('DAY') >= 0) {
        format = format.replace('DAY', String(dateClass.getDate()))
      }
      if (format.search('HH') >= 0) {
        const hours = dateClass.getHours() > 9 ? dateClass.getHours() : (`0${dateClass.getHours()}`)
        format = format.replace('HH', String(hours))
      }
      if (format.search('mm') >= 0) {
        const minutes = dateClass.getMinutes() > 9 ? dateClass.getMinutes() : (`0${dateClass.getMinutes()}`)
        format = format.replace('mm', String(minutes))
      }
      if (format.search('ss') >= 0) {
        const seconds = dateClass.getSeconds() > 9 ? dateClass.getSeconds() : (`0${dateClass.getSeconds()}`)
        format = format.replace('ss', String(seconds))
      }
      // if (format.search('MONTH') >= 0) {
      //   const monthInt = dateClass.getMonth()
      //   let monthName = String(dateClass.getMonth())
      //   switch (i18n.locale) {
      //     case 'ru':
      //       monthName = String(monthsRu[monthInt]).toLowerCase()
      //       break
      //     case 'oz':
      //       monthName = String(monthsUz[monthInt]).toLowerCase()
      //       break
      //     default:
      //       monthName = String(monthsCryl[monthInt]).toLowerCase()
      //       break
      //   }
      //   format = format.replace('MONTH', monthName)
      // }
      return format
    }
    return ''
  }
  function dateToYMD(date: any) {
    const sDate = new Date(date)
    const year = sDate.toLocaleString('default', { year: 'numeric' })
    const month = sDate.toLocaleString('default', { month: '2-digit' })
    const day = sDate.toLocaleString('default', { day: '2-digit' })
    const formattedDate = year + '-' + month + '-' + day
    return formattedDate
  }
  function dateFormatDMY(date: any) {
    const sDate = new Date(date)
    const year = sDate.toLocaleString('default', { year: 'numeric' })
    const month = sDate.toLocaleString('default', { month: '2-digit' })
    const day = sDate.toLocaleString('default', { day: '2-digit' })
    const formattedDate = day + '.' + month + '.' + year
    return formattedDate
  }

  return {
    isAuth,
    dateToYMD,
    dateFormatDMY,
    formatDateYmd,
  }
}
