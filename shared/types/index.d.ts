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
  station_name: string
  village_number: number
  candidate_number: number
  first_name: string
  last_name: string
  total_votes: number
  last_updated: Date
}

export interface BallotByVillage {
  village_number: number
  village_name: string
  candidate_type: string
  candidate_type_code: string
  valid_vote: number
  invalid_vote: number
  no_vote: number
}
