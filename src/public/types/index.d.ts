declare module '*.scss' {
  const content: { [className: string]: string }
  export = content
}

declare type jsonFileType = {
  sessionType: string
  trackName: string
  sessionIndex: number
  raceWeekendIndex: number
  metaData: string
  serverName: string
  sessionResult: {
    bestlap: number
    bestSplits: number[]
    isWetSession: number
    type: number
    leaderBoardLines: {
      car: {
        carId: number
        raceNumber: number
        carModel: number
        cupCategory: number
        carGroup: string
        teamName: string
        nationality: number
        carGuid: number
        teamGuid: number
        drivers: { firstName: string; lastName: string; shortName: string; playerId: string }[]
      }
      currentDriver: {
        firstName: string
        lastName: string
        shortName: string
        playerId: string
      }
      currentDriverIndex: number
      timing: {
        lastLap: number
        lastSplits: number[]
        bestLap: number
        bestSplits: number[]
        totalTime: number
        lapCount: number
        lastSplitId: number
      }
      missingMandatoryPitstop: number
      driverTotalTimes: number[]
    }[]
  }
  laps: {
    carId: number
    driverIndex: number
    laptime: number
    isValidForBest: boolean
    splits: number[]
  }[]
  penalties: {
    carId: number
    driverIndex: number
    reason: string
    penalty: string
    penaltyValue: number
    violationInLap: number
    clearedInLap: number
  }[]
}

declare type jsonFileTypeEx = {
  sessionType: string
  trackName: string
  sessionIndex: number
  raceWeekendIndex: number
  metaData: string
  serverName: string
  sessionResult: {
    bestlap: number
    bestSplits: number[]
    isWetSession: number
    type: number
    leaderBoardLines: {
      car: {
        carId: number
        raceNumber: number
        carModel: number
        carModelString: string
        cupCategory: number
        carGroup: string
        teamName: string
        nationality: number
        carGuid: number
        teamGuid: number
        drivers: { firstName: string; lastName: string; shortName: string; playerId: string }[]
      }
      currentDriver: {
        firstName: string
        lastName: string
        shortName: string
        playerId: string
      }
      currentDriverIndex: number
      timing: {
        lastLap: number
        lastSplits: number[]
        bestLap: number
        bestSplits: number[]
        totalTime: number
        lapCount: number
        lastSplitId: number
      }
      missingMandatoryPitstop: number
      driverTotalTimes: number[]
    }[]
  }
  laps: {
    carId: number
    driverIndex: number
    laptime: number
    isValidForBest: boolean
    splits: number[]
  }[]
  penalties: {
    carId: number
    driverIndex: number
    reason: string
    penalty: string
    penaltyValue: number
    violationInLap: number
    clearedInLap: number
  }[]
}
