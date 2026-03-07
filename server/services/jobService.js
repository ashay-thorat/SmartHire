import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const findJobs = async (skills, jobTitle) => {
  // Try multiple queries as fallback
  const queries = [
    `${jobTitle} ${skills.slice(0, 2).join(' ')}`,
    jobTitle,
    skills.slice(0, 3).join(' ') + ' developer',
  ]

  for (const query of queries) {
    try {
      const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
        params: {
          query,
          page: '1',
          num_pages: '2',
          date_posted: 'all',        // ← changed from 'month' to 'all'
          country: 'in',             // ← added India filter for Naukri/Indian jobs
        },
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        },
      })

      const jobs = response.data.data
      if (jobs && jobs.length > 0) {
        return jobs.slice(0, 10).map((job) => ({
          id: job.job_id,
          title: job.job_title,
          company: job.employer_name,
          location: job.job_city ? `${job.job_city}, ${job.job_country}` : job.job_country,
          type: job.job_employment_type,
          platform: job.job_publisher,
          logo: job.employer_logo,
          url: job.job_apply_link,
          posted: job.job_posted_at_datetime_utc,
          description: job.job_description?.slice(0, 200) + '...',
        }))
      }
    } catch (err) {
      console.error(`Query failed: ${query}`, err.message)
    }
  }

  return [] // return empty only if all queries fail
}

export default findJobs