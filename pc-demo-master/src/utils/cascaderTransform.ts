function normalizeLicenseCascadeData(data: any) {
  if (Array.isArray(data)) return data
  if (!data || typeof data !== "object") return []

  const { jobList, licenseList } = data
  if (!Array.isArray(jobList)) return []

  const licenseMap = new Map<string, any[]>()
  if (Array.isArray(licenseList)) {
    licenseList.forEach((license) => {
      const jobId = String(license?.jobId || "")
      if (!jobId) return
      if (!licenseMap.has(jobId)) licenseMap.set(jobId, [])
      licenseMap.get(jobId)!.push(license)
    })
  }

  return jobList.map((job: any) => ({
    jobId: job?.jobId || job?.id,
    jobName: job?.jobName || job?.name,
    licenseNodes: licenseMap.get(String(job?.jobId || job?.id || "")) || []
  }))
}

export function transformLicenseCascade(data: any) {
  const normalizedData = normalizeLicenseCascadeData(data)
  // 上岗证是有两级么最多？？后面再确定吧
  return normalizedData.map((item: any) => {
    return {
      value: item.jobId,
      label: item.jobName,
      // 避免只有一级的问题
      licenseId: item.jobId,
      licenseName: item.jobName,
      jobName: item.jobName,
      jobId: item.jobId,
      children: item.licenseNodes?.map((node: any) => {
        return {
          value: node.licenseId,
          label: node.licenseName,
          licenseId: node.licenseId,
          licenseName: node.licenseName,
          jobName: item.jobName,
          jobId: item.jobId
        }
      })
    }
  })
}

export function transformDeviceOptions(data: any) {
  if (!Array.isArray(data)) return []
  return data.map((item: any) => {
    return {
      value: item.id,
      label: item.categoryName,
      children: item.subDirs?.map((node: any) => {
        return {
          value: node.id,
          label: node.categoryName
        }
      })
    }
  })
}
