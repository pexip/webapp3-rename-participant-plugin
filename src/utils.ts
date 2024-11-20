import { DEPARTMENTS_CONFIG, PLUGIN_ID, SIP_CONFIG } from './constants'
import { Department, SipConfig } from './types'

/**
 * Read the departments configuration from the web server
 * @returns - The departments configuration
 */
export const readDepartmentsConfiguration = async (): Promise<Department[]> => {
  try {
    const webPath = getWebPath()
    const response = await fetch(webPath + '/' + DEPARTMENTS_CONFIG)
    const data = await response.json()

    const departments: Department[] = Object.keys(data).map((key) => ({
      label: key,
      id: data[key].id,
      carts: data[key].carts
    }))

    return departments
  } catch (error) {
    return []
  }
}

/**
 * Read the SIP configuration from the web server
 * @returns - The SIP configuration
 */
export const readSipConfiguration = async (): Promise<SipConfig> => {
  const webPath = getWebPath()
  const response = await fetch(webPath + '/' + SIP_CONFIG)
  const sipConfiguration = (await response.json()) as SipConfig
  return sipConfiguration
}

/**
 * Get the web path
 * @returns - The web path
 */
const getWebPath = () => {
  const webUrl = window.location.href
  const webPath = webUrl.substring(0, webUrl.lastIndexOf('/'))
  return webPath
}
