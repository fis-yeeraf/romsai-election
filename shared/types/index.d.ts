export interface Candidate {
  id: string
  first_name: string
  last_name: string
  number: number
  avatar?: string
  village_number: number
}

export interface PollingStation {
  id: string
  name: string
  address: string
  village_number?: number
}

export interface VoteResult {
  id?: string
  candidate_id: string
  polling_station_id: string
  vote_count: number
  created_at?: string
  updated_at?: string
}

export interface CandidateSummaryVoteByStation {
  id?: string
  number: number
  candidate_name: string
  station_name: string
  total_votes: number
}

export interface SummaryVoteByStation {
  station_id: string
  station_name: string
  candidates: CandidateSummaryVoteByStation[]
}

export interface CandidateVoteSummary {
  village_number: number
  village_name: string
  number: number
  first_name: string
  last_name: string
  avatar?: string
  total_votes: number
  last_updated: Date
}

export interface CandidateVoteSummaryByStation {
  station_id: string
  station_name: string
  village_number: number
  candidate_number: number
  first_name: string
  last_name: string
  total_votes: number
  total_voters: number
  last_updated: Date
}

export interface BallotByVillage {
  village_number: number
  village_name: string
  candidate_type: string
  candidate_type_code: string
  valid_votes: number
  invalid_votes: number
  no_votes: number
}

export interface BallotByStation {
  station_id: string
  village_number: number
  village_name: string
  candidate_type_code: string
  valid_votes: number
  invalid_votes: number
  no_votes: number
  total_ballots: number
}

export interface RecordVote {
  stationName: string
  villageNumber: number
  candidateNumber: number | null | string
  candidateType: "mayor" | "council"
  ballotType: "valid" | "invalid" | "no_vote"
  score: number
}

export interface RecordVotes {
  stationName: string
  villageNumber: number
  candidate1Number: number | null | string
  candidate2Number: number | null | string
  candidateType: "mayor" | "council"
  ballotType: "valid" | "invalid" | "no_vote"
  score: number
}

export interface CountingProgressByStation {
  station_id: string
  station_name: string
  village_number: number
  total_eligible_voters: number
  total_counted: number
  counting_percentage: number
}

export interface CountingProgressByVillage {
  village_number: number
  total_eligible_voters: number
  total_counted: number
  counting_percentage: number
}
