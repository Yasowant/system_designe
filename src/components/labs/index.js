import RateLimiterLab from './RateLimiterLab'
import LoadBalancerLab from './LoadBalancerLab'
import EstimatorLab from './EstimatorLab'
import HashRingLab from './HashRingLab'
import SnowflakeLab from './SnowflakeLab'
import Base62Lab from './Base62Lab'
import LruLab from './LruLab'

export const LABS = {
  'rate-limiter': RateLimiterLab,
  'load-balancer': LoadBalancerLab,
  estimator: EstimatorLab,
  'hash-ring': HashRingLab,
  snowflake: SnowflakeLab,
  base62: Base62Lab,
  lru: LruLab,
}
