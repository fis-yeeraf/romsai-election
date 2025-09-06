interface Candidate {
  id: string
  first_name: string
  last_name: string
  number: number
  avatar?: string
}

interface PollingStation {
  id: string
  name: string
  address: string
}

interface VoteResult {
  id?: string
  candidate_id: string
  polling_station_id: string
  vote_count: number
  created_at?: string
  updated_at?: string
}

interface CandidateSummaryVoteByStation {
  id?: string
  number: number
  candidate_name: string
  station_name: string
  total_votes: number
}

interface SummaryVoteByStation {
  station_id: string
  station_name: string
  candidates: CandidateSummaryVoteByStation[]
}
